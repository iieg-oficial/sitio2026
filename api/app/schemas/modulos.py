from pydantic import BaseModel

class ModulosCreate(BaseModel):
    nombre: str
    descripcion: str

class ModulosOut(BaseModel):
    id: int
    nombre: str
    descripcion: str

    class Config:
        from_attributes = True

class ModulosResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str

    class Config:
        from_attributes = True