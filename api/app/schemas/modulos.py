from pydantic import BaseModel
from typing import List
from slugify import slugify

class ModulosCreate(BaseModel):    
    nombre: str
    descripcion: str = None
    slug: Optional[str] = None

class ModulosOut(BaseModel):
    id: int
    nombre: str
    descripcion: str = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class ModulosResponse(BaseModel):
    modulos: List[ModulosOut]
    total: int

    class Config:
        from_attributes = True