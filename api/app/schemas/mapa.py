from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum
from app.models.mapa import TipoMapaEnum
from app.core.database import Base

class MapaCreate(BaseModel):
    titulo: str
    tipo: Optional[TipoMapaEnum] = None
    autor: Optional[str] = None
    anyo: Optional[int] = None
    area: Optional[str] = None
    editor: Optional[str] = None
    medida: Optional[str] = None
    escala: Optional[str] = None
    edicion: Optional[str] = None
    ubicacion: Optional[str] = None
    sitio_web: Optional[str] = None
    informacion: Optional[str] = None
    imagen: Optional[str] = None
    archivo: Optional[str] = None   
    slug: Optional[str] = None

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
    tipo: Optional[TipoMapaEnum] = None
    autor: Optional[str] = None
    anyo: Optional[int] = None
    area: Optional[str] = None
    editor: Optional[str] = None
    medida: Optional[str] = None
    escala: Optional[str] = None
    edicion: Optional[str] = None
    ubicacion: Optional[str] = None
    sitio_web: Optional[str] = None
    informacion: Optional[str] = None
    imagen: Optional[str] = None
    archivo: Optional[str] = Noneslug: Optional[str] = None

    class Config:
        from_attributes = True

class MapaResponse(BaseModel):
    mapas: List[MapaOut]
    anyo: int = None
    total: int