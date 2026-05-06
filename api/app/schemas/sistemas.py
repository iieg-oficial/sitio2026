from pydantic import BaseModel, field_validator
from enum import Enum
from typing import List, Optional
from app.schemas.subject import SubjectFlat

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
    claves: Optional[str] = None    
    slug: Optional[str] = None
    tema_ids: Optional[List[int]] = None
    destacado: bool = False
    orden: int

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_tema_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v

class SistemasOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    link: str
    tipo: TipoSistemaEnum
    imagen: Optional[str] = None
    claves: Optional[str] = None    
    slug: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    destacado: bool = False
    orden: int

    class Config:
        from_attributes = True

class SistemasResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    link: str
    tipo: TipoSistemaEnum
    imagen: Optional[str] = None
    claves: Optional[str] = None    
    slug: Optional[str] = None
    destacado: bool = False
    orden: int
    temas: Optional[List[SubjectFlat]] = []

    class Config:
        from_attributes = True

class SistemasList(BaseModel):
    sistemas: List[SistemasResponse]
    total: int