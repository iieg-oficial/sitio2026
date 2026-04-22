from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.subject import SubjectOut
from slugify import slugify

class PostCreate(BaseModel):
    titulo: str
    resumen: str = ""
    contenido: str
    autor: str = "IIEG"
    fecha: Optional[datetime] = None
    keywords: str = ""
    subject_id: int
    slug: Optional[str] = None

class PostOut(BaseModel):
    id: int
    titulo: str
    resumen: str
    contenido: str
    autor: str
    fecha: datetime
    keywords: str
    subject_id: int
    subject: SubjectOut
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    titulo: str
    resumen: str
    contenido: str
    autor: str
    fecha: datetime
    keywords: str
    subject_id: int
    subject: SubjectOut
    slug: Optional[str] = None

    class Config:                              
        from_attributes = True
    