"""
Modelos SQLAlchemy para la base de datos
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """Modelo de usuario"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    conductores = relationship("Conductor", back_populates="usuario")
    incidencias = relationship("Incidencia", back_populates="usuario")


class Conductor(Base):
    """Modelo de conductor"""
    __tablename__ = "conductores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String, nullable=False)
    licencia = Column(String, unique=True, nullable=False)
    estado = Column(String, default="activo")
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("User", back_populates="conductores")
    vehiculos = relationship("Vehiculo", back_populates="conductor")
    asignaciones = relationship("Asignacion", back_populates="conductor")


class Vehiculo(Base):
    """Modelo de vehículo"""
    __tablename__ = "vehiculos"

    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String, unique=True, index=True, nullable=False)
    marca = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    capacidad_toneladas = Column(Float, nullable=False)
    año = Column(Integer, nullable=False)
    estado = Column(String, default="disponible")
    conductor_id = Column(Integer, ForeignKey("conductores.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conductor = relationship("Conductor", back_populates="vehiculos")
    asignaciones = relationship("Asignacion", back_populates="vehiculo")


class Ruta(Base):
    """Modelo de ruta"""
    __tablename__ = "rutas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    distancia_km = Column(Float, nullable=False)
    tiempo_estimado_minutos = Column(Integer, nullable=False)
    estado = Column(String, default="activa")
    created_at = Column(DateTime, default=datetime.utcnow)

    asignaciones = relationship("Asignacion", back_populates="ruta")


class Incidencia(Base):
    """Modelo de incidencia/reporte"""
    __tablename__ = "incidencias"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    ubicacion = Column(String, nullable=True)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    estado = Column(String, default="abierta")
    prioridad = Column(String, default="media")
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("User", back_populates="incidencias")


class Asignacion(Base):
    """Modelo de asignación de ruta a conductor"""
    __tablename__ = "asignaciones"

    id = Column(Integer, primary_key=True, index=True)
    conductor_id = Column(Integer, ForeignKey("conductores.id"), nullable=False)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    ruta_id = Column(Integer, ForeignKey("rutas.id"), nullable=False)
    fecha_asignacion = Column(DateTime, default=datetime.utcnow)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    estado = Column(String, default="pendiente")
    created_at = Column(DateTime, default=datetime.utcnow)

    conductor = relationship("Conductor", back_populates="asignaciones")
    vehiculo = relationship("Vehiculo", back_populates="asignaciones")
    ruta = relationship("Ruta", back_populates="asignaciones")
