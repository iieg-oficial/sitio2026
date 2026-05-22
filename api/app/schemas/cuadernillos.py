from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from app.models.cuadernillos import MunicipioEnum

class CuadernilloCreate(BaseModel):
    titulo: str
    archivo: Optional[str] = None
    municipio: Optional[MunicipioEnum] = None
    anyo: Optional[int] = None
    slug: Optional[str] = None

class CuadernilloOut(BaseModel):
    id: int
    titulo: str
    archivo: Optional[str] = None
    municipio: Optional[MunicipioEnum] = None
    anyo: Optional[int] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class CuadernilloResponse(BaseModel):
    cuadernillos: List[CuadernilloOut]
    total: int
