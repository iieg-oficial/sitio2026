from pydantic import BaseModel


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
    id: int
    numero: int
    descripcion: str

    class Config:
        from_attributes = True