import re
from typing import List, Optional

from pydantic import BaseModel


def valid_hex(v: str) -> str:
    if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
        raise ValueError('Color inválido, debe ser formato #RRGGBB')
    return v.upper()

class BannerCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    imagen_desktop: Optional[str] = None
    imagen_mobile: Optional[str] = None
    imagen: Optional[str] = None
    link: Optional[str] = None
    boton: Optional[str] = None
    color_fondo: Optional[str] | None = None
    full_screen: Optional[bool] = False
    slug: Optional[str] = None

    @classmethod
    def valid_hex(cls, v: str) -> str:
        if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError('Color inválido, debe ser formato #RRGGBB')
        return v.upper()

class BannerOut(BaseModel):
    id: int
    titulo: str
    descripcion: Optional[str] = None
    imagen_desktop: Optional[str] = None
    imagen_mobile: Optional[str] = None
    imagen: Optional[str] = None
    link: Optional[str] = None
    boton: Optional[str] = None
    color_fondo: Optional[str] | None = None
    full_screen: Optional[bool] = False
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class BannerResponse(BaseModel):
    banners: List[BannerOut]
    total: int


