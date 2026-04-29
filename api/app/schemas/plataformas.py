from pydantic import BaseModel
from slugify import slugify

class PlataformasCreate(BaseModel):
    titulo: str
    descripcion: str
    url: str
    imagen: str
    destacada: bool = False
    orden: int
    slug: Optional[str] = None

class PlataformasOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    url: str
    imagen: str
    destacada: bool = False
    orden: int
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class PlataformasResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    url: str
    imagen: str
    destacada: bool = False
    orden: int
    slug: Optional[str] = None

    class Config:
        from_attributes = True