from pydantic import BaseModel
from enum import Enum
from typing import Optional, List

class AreaEnum(str, Enum):
    desarrollo = "desarrollo"
    analisis = "analisis"
    geoespacial = "geoespacial"    
    grafico = "grafico"
    juridico = "juridico"
    administracion = "administracion"
    

class PerfilesCreate(BaseModel):
    nombre: str
    descripcion: str = None
    area: AreaEnum = None

class PerfilesOut(BaseModel):
    id: int
    nombre: str
    descripcion: str = None
    area: AreaEnum = None

    class Config:
        from_attributes = True

class PerfilesResponse(BaseModel):
    perfiles: list[PerfilesOut]
    total: int

    class Config:
        from_attributes = True