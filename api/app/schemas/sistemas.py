from pydantic import BaseModel, field_validator, computed_field
from enum import Enum
from typing import List, Optional
from app.schemas.subject import SubjectFlat
from app.models.sistemas import TipoSistemaEnum

class SistemasCreate(BaseModel):
    titulo: str
    descripcion: Optional[str]
    link: Optional[str] = None
    tipo: TipoSistemaEnum
    imagen: Optional[str] = None 
    claves: Optional[str] = None    
    slug: Optional[str] = None
    tema_ids: Optional[List[int]] = None
    destacado: Optional[bool] = False
    slider: Optional[bool] = False
    imagen_slider: Optional[str] = None
    orden: Optional[int] = None

    @field_validator('tipo', mode='before')
    @classmethod
    def clean_tipo(cls, v):
        if isinstance(v, str) and v == 'datos_recientes':
            return 'datos-recientes'
        return v

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_tema_ids(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v


class SistemasOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    link: Optional[str] = None
    tipo: TipoSistemaEnum
    imagen: Optional[str] = None
    claves: Optional[str] = None    
    slug: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    destacado: Optional[bool] = False
    slider: bool = False
    imagen_slider: Optional[str] = None
    orden: Optional[int] = None

    class Config:
        from_attributes = True

class SistemasResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    link: Optional[str] = None
    tipo: TipoSistemaEnum
    imagen: Optional[str] = None
    claves: Optional[str] = None    
    slug: Optional[str] = None
    destacado: bool = False
    slider: bool = False
    imagen_slider: Optional[str] = None
    orden: int
    temas: Optional[List[SubjectFlat]] = []

    @computed_field
    @property
    def tipo_label(self) -> str:
        return self.tipo.label if self.tipo else self.tipo

    class Config:
        from_attributes = True

class SistemasList(BaseModel):
    sistemas: List[SistemasResponse]
    total: int