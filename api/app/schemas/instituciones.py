from pydantic import BaseModel

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
    id: int
    nombre: str
    descripcion: str
    logo: str

    class Config:
        from_attributes = True