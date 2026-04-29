from pydantic import BaseModel
from typing import List
from slugify import slugify

class ProfesoresCreate(BaseModel):
    nombre: str
    puesto: str
    descripcion: str
    foto: str | None = None
    slug: Optional[str] = None

class ProfesoresOut(BaseModel):
    id: int
    nombre: str
    puesto: str
    descripcion: str
    foto: str | None = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class ProfesoresResponse(BaseModel):
    profesores: List[ProfesoresOut]
    total: int

    class Config:
        from_attributes = True