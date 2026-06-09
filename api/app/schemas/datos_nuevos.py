from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from app.models.datos_nuevos import NuevoEnum


class DatosNuevosCreate(BaseModel):
    cifras: str
    descripcion: str
    tipo: Optional[NuevoEnum] = None
    slug: Optional[str] = None


class DatosNuevosOut(BaseModel):
    id: int
    cifras: str
    descripcion: str
    tipo: Optional[NuevoEnum] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class DatosNuevosResponse(BaseModel):
    datos_nuevos: List[DatosNuevosOut]
    total: int