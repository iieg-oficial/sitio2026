from pydantic import BaseModel
from enum import Enum
from typing import List, Optional

class AreaEnum(str, Enum):
    desarrollo = "desarrollo"
    analisis = "analisis"
    geoespacial = "geoespacial"    
    grafico = "grafico"
    juridico = "juridico"
    administracion = "administracion"
    soporte = "soporte"    

class PerfilesCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    area: AreaEnum | None = None
    slug: Optional[str] = None

class PerfilesOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    area: AreaEnum | None = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class PerfilesResponse(BaseModel):
    perfiles: List[PerfilesOut]
    total: int

    class Config:
        from_attributes = True