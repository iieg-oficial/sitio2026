from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum
from typing import Optional, List
from app.schemas.subject import SubjectFlat

class PeriocidadEnum(str, Enum):
    diaria = "diaria"
    mensual = "mensual"
    anual = "anual"

class ReporteCreate(BaseModel):
    titulo: str
    descripcion: str
    fecha: Optional[datetime] = None
    periocidad: PeriocidadEnum = None
    subtema: Optional[str] = None
    archivo: Optional[str] = None
    tema_ids: Optional[List[int]] = None
    claves: Optional[str] = None    
    slug: Optional[str] = None

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_tema_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v

class ReporteOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    fecha: Optional[datetime] = None
    periocidad: PeriocidadEnum = None
    subtema: Optional[str] = None
    archivo: Optional[str] = None
    slug: Optional[str] = None
    claves: Optional[str] = None    
    temas: Optional[List[SubjectFlat]] = []

    class Config:
        from_attributes = True

class ReporteResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    fecha: Optional[datetime] = None
    periocidad: PeriocidadEnum = None
    subtema: Optional[str] = None
    archivo: Optional[str] = None
    slug: Optional[str] = None
    claves: Optional[str] = None    
    temas: Optional[List[SubjectFlat]] = []

    class Config:
        from_attributes = True

class ReporteList(BaseModel):
    reportes: List[ReporteResponse]
    total: int