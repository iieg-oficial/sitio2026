from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from app.schemas.subject import SubjectOut

class ArchivoCreate(BaseModel):
    titulo: str
    fecha: Optional[datetime] = None
    tipo: str = None
    archivo: Optional[str] = None
    subject_id: Optional[int] = None
    periocidad: Optional[str] = None
    slug: Optional[str] = None
    
    @field_validator('subject_id', mode='before')
    @classmethod
    def zero_to_none(cls, v):
        if v == 0:
            return None
        return v

class ArchivoOut(BaseModel):
    id: int
    titulo: str
    fecha: Optional[datetime] = None
    tipo: str = None
    archivo: Optional[str] = None
    subject_id: Optional[int] = None
    subject: Optional[SubjectOut] = None
    periocidad: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class ArchivoResponse(BaseModel):
    id: int
    titulo: str
    fecha: Optional[datetime] = None
    tipo: str = None
    archivo: Optional[str] = None
    subject_id: Optional[int] = None
    subject: Optional[SubjectOut] = None
    periocidad: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class ArchivoList(BaseModel):
    archivos: List[ArchivoResponse]
    total: int