from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.subject import SubjectOut

class PostCreate(BaseModel):
    titulo: str
    resumen: str = ""
    contenido: str
    autor: str = "IIEG"
    fecha: Optional[datetime] = None
    keywords: str = ""
    subject_id: int

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

    class Config:                              
        from_attributes = True
    