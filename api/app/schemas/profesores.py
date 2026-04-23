from pydantic import BaseModel
from typing import List

class ProfesoresCreate(BaseModel):
    nombre: str
    puesto: str
    descripcion: str
    foto: str | None = None

class ProfesoresOut(BaseModel):
    id: int
    nombre: str
    puesto: str
    descripcion: str
    foto: str | None = None

    class Config:
        from_attributes = True

class ProfesoresResponse(BaseModel):
    profesores: List[ProfesoresOut]
    total: int

    class Config:
        from_attributes = True