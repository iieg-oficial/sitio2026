from pydantic import BaseModel, field_validator
from datetime import datetime

from app.core.database import Base

class MapaCreate(BaseModel):
    titulo: str
    anyo: int = None
    imagen: str = None
    archivo: str = None
    autor: str = None
    medida: str = None
    escala: str = None
    edicion: str = None
    editor: str = None
    sitio_web: str = None
    ubicacion: str = None
    informacion: str = None

    @field_validator('anyo')
    @classmethod
    def validar_anio(cls, v):
        anio_actual = datetime.now().year
        if v is not None and (v < 0 or v > anio_actual):
            raise ValueError(f"El año debe estar entre 0 y {anio_actual}")
        return v

class MapaOut(BaseModel):
    id: int
    titulo: str
    anyo: int = None
    imagen: str = None
    archivo: str = None
    autor: str = None
    medida: str = None
    escala: str = None
    edicion: str = None
    editor: str = None
    sitio_web: str = None
    ubicacion: str = None
    informacion: str = None

    class Config:
        from_attributes = True

class MapaResponse(BaseModel):
    mapas: list[MapaOut]
    anyo: int = None
    total: int