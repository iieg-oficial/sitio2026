from pydantic import BaseModel
from typing import List

class InstitucionesCreate(BaseModel):
    nombre: str
    descripcion: str
    logo: str

class InstitucionesOut(BaseModel):
    id: int
    nombre: str
    descripcion: str
    logo: str

    class Config:
        from_attributes = True

class InstitucionesResponse(BaseModel):
    instituciones: List[InstitucionesOut]
    total: int

    class Config:
        from_attributes = True