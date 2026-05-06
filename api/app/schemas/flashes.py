from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import List, Optional
from app.schemas.subject import SubjectFlat

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
    tema_ids: Optional[List[int]] = None
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
    temas: Optional[List[SubjectFlat]] = []
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class FlashesResponse(BaseModel):
    id: int
    titulo: str
    desc_jal: str
    desc_nac: str
    periocidad: PeriocidadEnum = None
    fecha_publicacion: datetime = None
    fuente: str = None
    link: str = None
    temas: Optional[List[SubjectFlat]] = []
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class FlashesList(BaseModel):
    flashes: List[FlashesResponse]
    total: int