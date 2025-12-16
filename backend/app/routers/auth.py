"""
Router de autenticación para FastAPI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import hashlib
import os
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/auth", tags=["authentication"])

# Configuración JWT (simplificado para desarrollo)
SECRET_KEY = os.getenv("SECRET_KEY", "desarrollo-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 horas


class LoginRequest(BaseModel):
    """Modelo para solicitud de login"""
    identifier: str  # Email o teléfono
    username: Optional[str] = None  # Para compatibilidad
    password: str


class LoginResponse(BaseModel):
    """Modelo para respuesta de login"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    """Modelo de respuesta de usuario"""
    id: int
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    class Config:
        from_attributes = True


def hash_password(password: str) -> str:
    """Hash de contraseña con SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def create_dummy_token(user_id: int, email: str) -> str:
    """Crear un token JWT dummy (simplificado)"""
    # En producción, usar python-jose con RS256
    import base64
    import json
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": datetime.utcnow().timestamp(),
        "exp": (datetime.utcnow() + timedelta(hours=24)).timestamp()
    }
    token = base64.b64encode(json.dumps(payload).encode()).decode()
    return token


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint de login
    Acepta identifier (email o teléfono) y password
    """
    try:
        # Validación de entrada
        if not credentials.identifier or not credentials.password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=[{
                    "type": "value_error",
                    "loc": ["body", "identifier"],
                    "msg": "identifier y password son requeridos"
                }]
            )
        
        # Buscar usuario por email o teléfono
        user = db.query(User).filter(
            (User.email == credentials.identifier) |
            (User.phone == credentials.identifier)
        ).first()
        
        if not user:
            # Crear usuario de prueba si no existe
            # (En producción, devolver error de credentials inválidas)
            password_hash = hash_password(credentials.password)
            user = User(
                email=credentials.identifier,
                username=credentials.username or credentials.identifier,
                phone=credentials.identifier if credentials.identifier.isdigit() else None,
                password_hash=password_hash,
                is_active=True,
                first_name="Usuario",
                last_name="Test"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Actualizar último login
        user.last_login_at = datetime.utcnow()
        db.commit()
        
        # Generar token
        access_token = create_dummy_token(user.id, user.email)
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/me", response_model=UserModel)
async def get_current_user(db: Session = Depends(get_db)):
    """Obtener información del usuario actual"""
    # TODO: Implementar con JWT verification
    return UserModel(
        id=1,
        email="test@example.com",
        username="test",
        first_name="Test",
        last_name="User"
    )


@router.post("/refresh")
async def refresh_token(db: Session = Depends(get_db)):
    """Refrescar token JWT"""
    # TODO: Implementar refresh token
    return {"access_token": "new_token", "token_type": "bearer"}


@router.post("/logout")
async def logout(db: Session = Depends(get_db)):
    """Logout del usuario"""
    return {"message": "Logout exitoso"}
