from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum
from typing import List, Optional
from app.schemas.subject import SubjectFlat
from app.models.flashes import PeriocidadEnum, MesEnum


class FlashesCreate(BaseModel):
    titulo: str
    desc_jal: str
    desc_nac: str
    periocidad: PeriocidadEnum = None
    fecha_publicacion: datetime = None
    mes: Optional[MesEnum] = None
    anyo: Optional[int] = None
    fuente: str = None
    link: str = None
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

class FlashesOut(BaseModel):
    id: int
    titulo: str
    desc_jal: str
    desc_nac: str
    periocidad: PeriocidadEnum = None
    fecha_publicacion: datetime = None
    mes: Optional[MesEnum] = None
    anyo: Optional[int] = None
    fuente: str = None
    link: str = None
    temas: Optional[List[SubjectFlat]] = []
    claves: Optional[str] = None    
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
    mes: Optional[MesEnum] = None
    anyo: Optional[int] = None
    fuente: str = None
    link: str = None
    temas: Optional[List[SubjectFlat]] = []
    claves: Optional[str] = None    
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class FlashesList(BaseModel):
    flashes: List[FlashesResponse]
    total: int