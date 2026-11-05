from typing import List, Optional
from pydantic import BaseModel, field_validator
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

    @field_validator("tipo", mode="before")
    @classmethod
    def normalizar_tipo(cls, v):
        if isinstance(v, str):
            val_clean = v.lower().strip()
            # Mapea variantes comunes al valor exacto que espera la definición Enum de Python
            if "certificac" in val_clean:
                return getattr(TipoServicioEnum, "certificacion", getattr(TipoServicioEnum, "Certificación", v))
            elif "transparencia" in val_clean:
                return getattr(TipoServicioEnum, "transparencia", getattr(TipoServicioEnum, "Transparencia", v))
            elif "servicio" in val_clean:
                return getattr(TipoServicioEnum, "servicio", getattr(TipoServicioEnum, "Servicio", v))
        return v

class ServiciosOut(BaseModel):
    id: int
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
