from pydantic import BaseModel
from typing import List, Optional
from slugify import slugify

class InstitucionesCreate(BaseModel):
    nombre: str
    descripcion: str
    logo: str

class InstitucionesOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    logo: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class InstitucionesResponse(BaseModel):
    instituciones: List[InstitucionesOut]
    total: int

    class Config:
        from_attributes = True