from typing import Optional, List
from app.schemas.subject import SubjectFlat
from app.schemas.sistemas import SistemasOut
from pydantic import BaseModel, field_validator
from enum import Enum
from app.models.documentacion import TipoEnum

class DocumentacionCreate(BaseModel):
    titulo: str
    descripcion: Optional[str]
    anyo: Optional[int] = None
    archivo: Optional[str] = None
    tipo : Optional[TipoEnum] = None
    claves: Optional[str] = None    
    slug: Optional[str] = None
    tema_ids: Optional[List[int]] = None
    sistema_ids: Optional[List[int]] = None

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_tema_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v

    @field_validator('sistema_ids', mode='before')
    @classmethod
    def clean_sistema_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v


class DocumentacionOut(BaseModel):
    id: int
    titulo: str
    descripcion: Optional[str]
    anyo: Optional[int] = None
    archivo: Optional[str] = None
    tipo : Optional[TipoEnum] = None
    claves: Optional[str] = None
    slug: Optional[str] = None

    temas: Optional[List[SubjectFlat]] = []
    sistemas: Optional[List[SistemasOut]] = []

    class Config:
        from_attributes = True

class DocumentacionResponse(BaseModel):
    id: int
    titulo: str
    descripcion: Optional[str]
    anyo: Optional[int] = None
    archivo: Optional[str] = None
    tipo : Optional[TipoEnum] = None
    claves: Optional[str] = None
    slug: Optional[str] = None

    temas: Optional[List[SubjectFlat]] = []
    sistemas: Optional[List[SistemasOut]] = []

    class Config:
        from_attributes = True

class DocumentacionList(BaseModel):
    documentaciones: List[DocumentacionResponse]
    total: int