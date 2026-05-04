from pydantic import BaseModel
from typing import Optional
from app.schemas.subject import SubjectOut

class PreguntasCreate(BaseModel):
    pregunta: str
    respuesta: str
    subject_id: int
    slug: Optional[str] = None

class PreguntasOut(BaseModel):
    id: int
    pregunta: str
    respuesta: str
    subject_id: int
    subject: SubjectOut
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class PreguntasResponse(BaseModel):
    id: int
    pregunta: str
    respuesta: str
    subject_id: Optional[int]
    subject: Optional[SubjectOut]
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class PreguntasListResponse(BaseModel):
    preguntas: list[PreguntasResponse]
    total: int