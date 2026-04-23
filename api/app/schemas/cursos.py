from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.modulos import ModulosOut
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
    inscripcion: str = None
    acreditacion: str = None
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
    modulo_ids: list[ModulosOut] = None
    inscripcion: str = None
    acreditacion: str = None
    vigencia: str = None
    contacto: str = None
    destacado: bool = False

    class Config:
        from_attributes = True

class CursosResponse(BaseModel):
    cursos: list[CursosOut]
    total: int