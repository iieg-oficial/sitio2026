from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.modulos import ModulosOut
from app.schemas.instituciones import InstitucionesOut
from app.models.cursos import TipoCurso

class CursosCreate(BaseModel):
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
    modulo_ids: list[int] = None
    instituciones_ids: list[int] = None
    inscripcion: str = None
    acreditacion: str = None
    vigencia: str = None
    contacto: str = None

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
    modulo_ids: list[ModulosOut] | None = None
    instituciones_ids: list[InstitucionesOut] | None = None
    inscripcion: str | None = None
    acreditacion: str | None = None
    vigencia: str | None = None
    contacto: str | None = None
    destacado: bool | None = None

    class Config:
        from_attributes = True

class CursosResponse(BaseModel):
    cursos: list[CursosOut]
    total: int