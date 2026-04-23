from pydantic import BaseModel
from typing import List

class ModuloCreate(BaseModel):
    id: int
    nombre: str
    descripcion: str = None

class ModuloOut(BaseModel):
    id: int
    nombre: str
    descripcion: str = None

    class Config:
        from_attributes = True

class ModuloResponse(BaseModel):
    modulos: list[ModuloOut]
    total: int

    class Config:
        from_attributes = True