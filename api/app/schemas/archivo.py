from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.subject import SubjectOut

class ArchivoCreate(BaseModel):
    titulo: str
    fecha: Optional[datetime] = None
    tipo: int
    subject_id: int
    periocidad: Optional[str] = None

class ArchivoOut(BaseModel):
    id: int
    titulo: str
    fecha: datetime
    tipo: int
    subject_id: int
    subject: SubjectOut
    periocidad: Optional[str] = None

    class Config:
        from_attributes = True


class ArchivoResponse(BaseModel):
    id: int
    titulo: str
    fecha: datetime
    tipo: int
    subject_id: int
    subject: SubjectOut
    periocidad: Optional[str] = None

    class Config:
        from_attributes = True