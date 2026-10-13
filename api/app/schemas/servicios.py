from typing import List, Optional
from pydantic import BaseModel
from app.models.servicios import TipoServicioEnum

class ServiciosCreate(BaseModel):
    codigo: Optional[str] = None
    tipo: TipoServicioEnum
    titulo: str
    formato_entrega: Optional[str] = None
    descripcion: Optional[str] = None
    unidad_medida: Optional[str] = None
    costos: Optional[str] = None
    politicas: Optional[str] = None
    slug: Optional[str] = None

class ServiciosOut(BaseModel):
    id: str
    codigo: Optional[str] = None
    tipo: TipoServicioEnum
    titulo: str
    formato_entrega: Optional[str] = None
    descripcion: Optional[str] = None
    unidad_medida: Optional[str] = None
    costos: Optional[str] = None
    politicas: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class ServiciosResponse(BaseModel):
    servicios: List[ServiciosOut]
    total: int