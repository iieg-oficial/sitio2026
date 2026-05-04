from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum
from typing import Optional, List
from app.schemas.subject import SubjectOut

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
    subject_id: Optional[int] = None
    slug: Optional[str] = None

    @field_validator('subject_id', mode='before')
    @classmethod
    def zero_to_none(cls, v):
        if v == 0:
            return None
        return v

class ReporteOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    fecha: Optional[datetime] = None
    periocidad: PeriocidadEnum = None
    subtema: Optional[str] = None
    archivo: Optional[str] = None
    subject_id: Optional[int] = None
    slug: Optional[str] = None

    subject: Optional[SubjectOut] = None

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
    subject_id: Optional[int] = None
    slug: Optional[str] = None

    subject: Optional[SubjectOut] = None

    class Config:
        from_attributes = True

class ReporteList(BaseModel):
    reportes: List[ReporteResponse]
    total: int