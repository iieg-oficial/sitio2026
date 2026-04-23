from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import List, Optional
from app.schemas.profesores import ProfesoresOut
from app.schemas.modulos import ModulosOut
from app.schemas.perfiles import PerfilesOut
from app.schemas.instituciones import InstitucionesOut

class TipoCurso(str, Enum):
    CAPACITACION = "Capacitación"
    CONVOCATORIA = "Convocatoria"

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
    profesores_id: Optional[int] = None
    modulo_id: Optional[int] = None
    inscripcion: str = None
    acreditacion: str = None
    perfiles_id: Optional[int] = None
    institucion_id: Optional[int] = None
    vigencia: str = None
    contacto: str = None

class CursosOut(BaseModel):
    id: int
    titulo: str
    descripcion: str = None
    inicio: datetime = None
    formato: str = None
    Horario: str = None
    Objetivo: str = None
    p_ingreso: str = None
    p_egreso: str = None
    tipo_curso: TipoCurso
    profesores_id: Optional[int] = None
    modulo_id: Optional[int] = None
    inscripcion: str = None
    acreditacion: str = None
    perfiles_id: Optional[int] = None
    institucion_id: Optional[int] = None
    vigencia: str = None
    contacto: str = None
    profesor: Optional[ProfesoresOut] = None
    modulo: Optional[ModulosOut] = None
    perfil: Optional[PerfilesOut] = None
    institucion: Optional[InstitucionesOut] = None
    destacado: bool = False

    class Config:
        from_attributes = True

class CursosResponse(BaseModel):
    cursos: list[CursosOut]
    total: int