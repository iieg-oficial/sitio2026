from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.subject import SubjectOut

class ArchivoCreate(BaseModel):
    titulo: str
    fecha: Optional[datetime] = None
    tipo: int
    subject_id: int

class ArchivoOut(BaseModel):
    id: int
    titulo: str
    fecha: datetime
    tipo: int
    subject_id: int
    subject: SubjectOut

    class Config:
        from_attributes = True


class ArchivoResponse(BaseModel):
    id: int
    titulo: str
    fecha: datetime
    tipo: int
    subject_id: int
    subject: SubjectOut

    class Config:
        from_attributes = True