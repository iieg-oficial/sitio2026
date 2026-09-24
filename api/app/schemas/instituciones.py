from typing import List, Optional

from pydantic import BaseModel


class InstitucionesCreate(BaseModel):
    nombre: str
    descripcion: Optional[str]
    logo: Optional[str]

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
