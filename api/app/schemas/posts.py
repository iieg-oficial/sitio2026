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
    claves: Optional[str] = None    
    subject_id: int
    slug: Optional[str] = None

class PostOut(BaseModel):
    id: int
    titulo: str
    resumen: str
    contenido: str
    autor: str
    fecha: datetime
    claves: Optional[str] = None    
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
    claves: Optional[str] = None    
    subject_id: int
    subject: SubjectOut
    slug: Optional[str] = None

    class Config:                              
        from_attributes = True
    