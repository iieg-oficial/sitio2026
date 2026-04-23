from pydantic import BaseModel
from enum import Enum
from typing import List

class AreaEnum(str, Enum):
    desarrollo = "desarrollo"
    analisis = "analisis"
    geoespacial = "geoespacial"    
    grafico = "grafico"
    juridico = "juridico"
    administracion = "administracion"
    

class PerfilesCreate(BaseModel):
    nombre: str
    descripcion: str | None = None
    area: AreaEnum | None = None

class PerfilesOut(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
    area: AreaEnum | None = None

    class Config:
        from_attributes = True

class PerfilesResponse(BaseModel):
    perfiles: List[PerfilesOut]
    total: int

    class Config:
        from_attributes = True