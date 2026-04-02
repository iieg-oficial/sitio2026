from pydantic import BaseModel
from typing import List


class DatosNuevosCreate(BaseModel):
    numero: int
    descripcion: str


class DatosNuevosOut(BaseModel):
    id: int
    numero: int
    descripcion: str

    class Config:
        from_attributes = True


class DatosNuevosResponse(BaseModel):
    datos_nuevos: List[DatosNuevosOut]
    total: int