from pydantic import BaseModel

class PlataformasCreate(BaseModel):
    titulo: str
    descripcion: str
    url: str
    imagen: str
    destacada: bool
    orden: int

class PlataformasOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    url: str
    imagen: str
    destacada: bool
    orden: int

    class Config:
        from_attributes = True

class PlataformasResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    url: str
    imagen: str
    destacada: bool
    orden: int

    class Config:
        from_attributes = True