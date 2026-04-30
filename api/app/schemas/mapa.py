from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from slugify import slugify

from app.core.database import Base

class MapaCreate(BaseModel):
    titulo: str
    anyo: Optional[int] = None
    imagen: Optional[str] = None
    archivo: Optional[str] = None
    autor: Optional[str] = None
    medida: Optional[str] = None
    escala: Optional[str] = None
    edicion: Optional[str] = None
    editor: Optional[str] = None
    sitio_web: Optional[str] = None
    ubicacion: Optional[str] = None
    informacion: Optional[str] = None
    slug: Optional[str] = None

    @field_validator('anyo')
    @classmethod
    def validar_anio(cls, v):
        anio_actual = datetime.now().year
        if v is not None and (v < 0 or v > anio_actual):
            raise ValueError(f"El año debe estar entre 0 y {anio_actual}")
        return v

from typing import Optional

class MapaOut(BaseModel):
    id: int
    titulo: str
    anyo: Optional[int] = None
    imagen: Optional[str] = None
    archivo: Optional[str] = None
    autor: Optional[str] = None
    medida: Optional[str] = None
    escala: Optional[str] = None
    edicion: Optional[str] = None
    editor: Optional[str] = None
    sitio_web: Optional[str] = None
    ubicacion: Optional[str] = None
    informacion: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class MapaResponse(BaseModel):
    mapas: List[MapaOut]
    anyo: int = None
    total: int