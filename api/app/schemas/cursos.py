from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.models.cursos import TipoCurso
from app.schemas.instituciones import InstitucionesOut
from app.schemas.modulos import ModulosOut
from app.schemas.perfiles import PerfilesOut
from app.schemas.profesores import ProfesoresOut
from app.schemas.subject import SubjectFlat


class CursosCreate(BaseModel):

    titulo: str
    descripcion: Optional[str] = None
    img_portada: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None
    formato: Optional[str] = None
    Horario: Optional[str] = None
    Objetivo: Optional[str] = None
    p_ingreso: Optional[str] = None
    p_egreso: Optional[str] = None
    tipo_curso: TipoCurso
    modulos: Optional[List[int]] = None
    instituciones: Optional[List[int]] = None
    perfiles: Optional[List[int]] = None
    profesores: Optional[List[int]] = None
    tema_ids: Optional[List[int]] = None
    inscripcion: Optional[str] = None
    acreditacion: Optional[str] = None
    vigencia: Optional[str] = None
    contacto: Optional[str] = None
    destacado: bool = False
    clave: Optional[str] = None
    archivo: Optional[str] = None
    formulario: Optional[str] = None
    slug: Optional[str] = None

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_temas(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v

class CursosOut(BaseModel):
    id: int
    titulo: str | None = None
    descripcion: str | None = None
    img_portada: Optional[str] = None
    inicio: datetime | None = None
    fin: datetime | None = None
    formato: str | None = None
    Horario: str | None = None
    Objetivo: str | None = None
    p_ingreso: str | None = None
    p_egreso: str | None = None
    tipo_curso: TipoCurso | None = None
    modulos: List[ModulosOut] = []
    instituciones: List[InstitucionesOut] = []
    perfiles: List[PerfilesOut] = []
    profesores: List[ProfesoresOut] = []
    temas: List[SubjectFlat] = []
    inscripcion: str | None = None
    acreditacion: str | None = None
    vigencia: str | None = None
    contacto: str | None = None
    destacado: bool | None = None
    clave: str | None = None
    archivo: Optional[str] = None
    formulario: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class CursosResponse(BaseModel):
    cursos: List[CursosOut]
    total: int
