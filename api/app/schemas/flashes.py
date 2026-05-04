from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import List, Optional
from app.schemas.subject import SubjectOut

class PeriocidadEnum(str, Enum):
    diaria = "diaria"
    mensual = "mensual"
    anual = "anual"

class FlashesCreate(BaseModel):
    titulo: str
    desc_jal: str
    desc_nac: str
    periocidad: PeriocidadEnum = None
    fecha_publicacion: datetime = None
    fuente: str = None
    link: str = None
    subject_id: Optional[int] = None
    slug: Optional[str] = None

class FlashesOut(BaseModel):
    id: int
    titulo: str
    desc_jal: str
    desc_nac: str
    periocidad: PeriocidadEnum = None
    fecha_publicacion: datetime = None
    fuente: str = None
    link: str = None
    subject_id: Optional[int] = None
    subject: Optional[SubjectOut] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class FlashesResponse(BaseModel):
    flashes: list[FlashesOut]
    total: int