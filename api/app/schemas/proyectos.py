from typing import List, Optional

from pydantic import BaseModel


class ProyectosCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    slug: Optional[str] = None

class ProyectosOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class ProyectosResponse(BaseModel):
    proyectos: List[ProyectosOut]
    total: int

    class Config:
        from_attributes = True
