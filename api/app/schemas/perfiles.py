from pydantic import BaseModel
from enum import Enum
from typing import Optional

class AreaEnum(str, Enum):
    desarrollo = "Desarrollador"
    analisis = "Análisis estadistico"
    geoespacial = "Análisis geoespacial"    
    grafico = "Diseño gráfico"
    juridico = "Apoyo jurídico"
    administracion = "Apoyo administrativo"
    

class PerfilesCreate(BaseModel):
    nombre: str
    descripcion: str
    area: AreaEnum = None

class PerfilesOut(BaseModel):
    id: int
    nombre: str
    descripcion: str
    area: AreaEnum = None

    class Config:
        from_attributes = True

class PerfilesResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    area: AreaEnum = None

    class Config:
        from_attributes = True