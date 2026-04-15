from pydantic import BaseModel
from app.schemas.subject import SubjectOut

class PreguntasCreate(BaseModel):
    titulo: str
    respuesta: str
    subject_id: int

class PreguntasOut(BaseModel):
    id: int
    titulo: str
    respuesta: str
    subject_id: int
    subject: SubjectOut

    class Config:
        from_attributes = True

class PreguntasResponse(BaseModel):
    id: int
    titulo: str
    respuesta: str
    subject_id: int
    subject: SubjectOut

    class Config:
        from_attributes = True