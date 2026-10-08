from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.models.flashes import MesEnum, PeriocidadEnum
from app.schemas.subject import SubjectFlat


class FlashesCreate(BaseModel):
    titulo: str
    desc_jal: Optional[str]
    desc_nac: Optional[str]
    periocidad: PeriocidadEnum
    fecha_publicacion: Optional[datetime] = None
    mes: Optional[MesEnum] = None
    anyo: Optional[int] = None
    fuente: Optional[str] = None
    link: Optional[str] = None
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
    desc_jal: Optional[str]
    desc_nac: Optional[str]
    periocidad: PeriocidadEnum
    fecha_publicacion: Optional[datetime] = None
    mes: Optional[MesEnum] = None
    anyo: Optional[int] = None
    fuente: Optional[str] = None
    link: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    claves: Optional[str] = None
    slug: str

    class Config:
        from_attributes = True


class FlashesResponse(BaseModel):
    id: int
    titulo: str
    desc_jal: Optional[str]
    desc_nac: Optional[str]
    periocidad: PeriocidadEnum
    fecha_publicacion: Optional[datetime] = None
    mes: Optional[MesEnum] = None
    anyo: Optional[int] = None
    fuente: Optional[str] = None
    link: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    claves: Optional[str] = None
    slug: str

    class Config:
        from_attributes = True


class FlashesList(BaseModel):
    flashes: List[FlashesResponse]
    total: int
