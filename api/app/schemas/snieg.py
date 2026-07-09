from pydantic import BaseModel
from typing import List, Optional

class SniegBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    imagen: Optional[str] = None
    enlace: Optional[str] = None
    slug: Optional[str] = None

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