from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.schemas.subject import SubjectFlat


class ArchivoCreate(BaseModel):
    titulo: str
    fecha: Optional[datetime] = None
    tipo: Optional[str] = None
    archivo: Optional[str] = None
    tema_ids: Optional[List[int]] = None
    periocidad: Optional[str] = None
    slug: Optional[str] = None

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_tema_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v


class ArchivoOut(BaseModel):
    id: int
    titulo: str
    fecha: Optional[datetime] = None
    tipo: Optional[str] = None
    archivo: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    periocidad: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class ArchivoResponse(BaseModel):
    id: int
    titulo: str
    fecha: Optional[datetime] = None
    tipo: Optional[str] = None
    archivo: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    periocidad: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class ArchivoList(BaseModel):
    archivos: List[ArchivoResponse]
    total: int
