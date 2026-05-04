from pydantic import BaseModel
from typing import List, Optional


class DatosNuevosCreate(BaseModel):
    numero: int
    descripcion: str
    slug: Optional[str] = None


class DatosNuevosOut(BaseModel):
    id: int
    numero: int
    descripcion: str
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class DatosNuevosResponse(BaseModel):
    datos_nuevos: List[DatosNuevosOut]
    total: int