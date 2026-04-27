from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from slugify import slugify
from app.schemas.modulos import ModulosOut
from app.schemas.instituciones import InstitucionesOut
from app.schemas.perfiles import PerfilesOut
from app.schemas.profesores import ProfesoresOut
from app.models.cursos import TipoCurso

class CursosCreate(BaseModel):
    
    titulo: str
    descripcion: str = None
    inicio: datetime = None
    formato: str = None
    Horario: str = None
    Objetivo: str = None
    p_ingreso: str = None
    p_egreso: str = None
    tipo_curso: TipoCurso
    modulos: Optional[List[int]] = None
    instituciones: Optional[List[int]] = None
    perfiles: Optional[List[int]] = None
    profesores: Optional[List[int]] = None
    inscripcion: str = None
    acreditacion: str = None
    vigencia: str = None
    contacto: str = None
    destacado: bool = False
    slug: Optional[str] = None

class CursosOut(BaseModel):
    id: int
    titulo: str | None = None
    descripcion: str | None = None
    inicio: datetime | None = None
    formato: str | None = None
    Horario: str | None = None
    Objetivo: str | None = None
    p_ingreso: str | None = None
    p_egreso: str | None = None
    tipo_curso: TipoCurso | None = None
    modulos: List[ModulosOut] = None
    instituciones: List[InstitucionesOut] = None
    perfiles: List[PerfilesOut] = None
    profesores: List[ProfesoresOut] = None
    inscripcion: str | None = None
    acreditacion: str | None = None
    vigencia: str | None = None
    contacto: str | None = None
    destacado: bool | None = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class CursosResponse(BaseModel):
    cursos: List[CursosOut]
    total: int