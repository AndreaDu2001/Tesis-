"""
Router de incidencias para FastAPI
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db

router = APIRouter(prefix="/incidencias", tags=["incidencias"])


class IncidenciaResponse(BaseModel):
    """Modelo de incidencia"""
    id: int
    titulo: str
    descripcion: str
    estado: str


@router.get("", response_model=List[IncidenciaResponse])
async def get_incidencias(db: Session = Depends(get_db)):
    """Obtener lista de incidencias"""
    # TODO: Implementar lógica real
    return []


@router.get("/{incidencia_id}", response_model=IncidenciaResponse)
async def get_incidencia(incidencia_id: int, db: Session = Depends(get_db)):
    """Obtener una incidencia específica"""
    # TODO: Implementar lógica real
    return {
        "id": incidencia_id,
        "titulo": "Reporte de basura",
        "descripcion": "Calle contaminada",
        "estado": "abierta"
    }


@router.post("", response_model=IncidenciaResponse)
async def create_incidencia(incidencia: dict, db: Session = Depends(get_db)):
    """Crear una nueva incidencia"""
    # TODO: Implementar lógica real
    return incidencia
