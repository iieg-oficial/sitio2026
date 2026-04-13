from pydantic import BaseModel
from typing import List

class SniegBase(BaseModel):
    titulo: str
    descripcion: str
    imagen: str | None = None
    enlace: str | None = None

class SniegCreate(SniegBase):
    pass

class SniegOut(SniegBase):
    id: int

    class Config:
        from_attributes = True

class SniegResponse(BaseModel):
    snieg: List[SniegOut]
    total: int

    class Config:
        from_attributes = True