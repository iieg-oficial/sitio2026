from pydantic import BaseModel
from datetime import datetime

from app.core.database import Base

class MapaCreate(BaseModel):
    titulo: str
    anyo: datetime = None
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

class MapaOut(BaseModel):
    id: int
    titulo: str
    anyo: datetime = None
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
    total: int