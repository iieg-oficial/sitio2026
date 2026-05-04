from pydantic import BaseModel
from enum import Enum
from typing import List, Optional

class TipoSistemaEnum(str, Enum):
    plataforma = "plataforma"
    datos = "datos-recientes"
    estadistica = "estadistica"
    otro = "otro"

class SistemasCreate(BaseModel):
    titulo: str
    descripcion: str
    link: str
    tipo: TipoSistemaEnum
    imagen: Optional[str] = None 
    slug: Optional[str] = None

class SistemasOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    link: str
    tipo: TipoSistemaEnum
    imagen: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class SistemasResponse(BaseModel):
    sistemas: list[SistemasOut]
    total: int