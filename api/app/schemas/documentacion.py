from typing import Optional, List
from app.schemas.subject import SubjectOut
from pydantic import BaseModel, field_validator
from app.schemas.subject import SubjectOut
from slugify import slugify

class DocumentacionCreate(BaseModel):
    titulo: str
    descripcion: str
    metodologia: Optional[str] = None
    codigo: Optional[str] = None
    claves: Optional[str] = None
    subject_id: Optional[int] = None
    slug: Optional[str] = None

    @field_validator('subject_id', mode='before')
    @classmethod
    def zero_to_none(cls, v):
        if v == 0:
            return None
        return v

class DocumentacionOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    metodologia: Optional[str] = None
    codigo: Optional[str] = None
    claves: Optional[str] = None
    subject_id: Optional[int] = None
    slug: Optional[str] = None

    subject: Optional[SubjectOut] = None

    class Config:
        from_attributes = True

class DocumentacionResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    metodologia: Optional[str] = None
    codigo: Optional[str] = None
    claves: Optional[str] = None
    subject_id: Optional[int] = None
    slug: Optional[str] = None

    subject: Optional[SubjectOut] = None

    class Config:
        from_attributes = True

class DocumentacionList(BaseModel):
    documentaciones: List[DocumentacionResponse]
    total: int