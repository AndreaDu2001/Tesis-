"""
Router de autenticación para FastAPI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["authentication"])


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


class UserModel(BaseModel):
    """Modelo de usuario"""
    id: int
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint de login
    Acepta identifier (email o teléfono) y password
    """
    try:
        # Validación básica
        if not credentials.identifier or not credentials.password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="identifier y password son requeridos"
            )
        
        # TODO: Implementar lógica de autenticación
        # Por ahora, retorna un token dummy
        return LoginResponse(
            access_token="dummy_token_" + credentials.identifier,
            token_type="bearer",
            user={
                "id": 1,
                "email": credentials.identifier,
                "username": credentials.username or credentials.identifier,
                "first_name": "Usuario",
                "last_name": "Test"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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
