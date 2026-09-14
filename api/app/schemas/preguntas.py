from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.schemas.subject import SubjectFlat


class PreguntasCreate(BaseModel):
    pregunta: str
    respuesta: str
    tema_ids: Optional[List[int]] = None
    claves: Optional[str] = None
    slug: Optional[str] = None

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_tema_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v

class PreguntasOut(BaseModel):
    id: int
    pregunta: str
    respuesta: str
    temas: Optional[List[SubjectFlat]] = []
    claves: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class PreguntasResponse(BaseModel):
    id: int
    pregunta: str
    respuesta: str
    temas: Optional[List[SubjectFlat]] = []
    claves: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class PreguntasList(BaseModel):
    preguntas: List[PreguntasResponse]
    total: int
