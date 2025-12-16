"""
Router de rutas para FastAPI
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db

router = APIRouter(prefix="/rutas", tags=["rutas"])


class RutaResponse(BaseModel):
    """Modelo de ruta"""
    id: int
    nombre: str
    descripcion: str
    distancia: float


@router.get("", response_model=List[RutaResponse])
async def get_rutas(db: Session = Depends(get_db)):
    """Obtener lista de rutas"""
    # TODO: Implementar lógica real
    return []


@router.get("/{ruta_id}", response_model=RutaResponse)
async def get_ruta(ruta_id: int, db: Session = Depends(get_db)):
    """Obtener una ruta específica"""
    # TODO: Implementar lógica real
    return {
        "id": ruta_id,
        "nombre": "Ruta Centro",
        "descripcion": "Ruta del centro histórico",
        "distancia": 12.5
    }


@router.post("", response_model=RutaResponse)
async def create_ruta(ruta: dict, db: Session = Depends(get_db)):
    """Crear una nueva ruta"""
    # TODO: Implementar lógica real
    return ruta
