from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Cursos
from app.models.cursos import TipoCurso
from app.schemas.cursos import CursosOut, CursosResponse

router = APIRouter(prefix="/cursos-public", tags=["cursos-public"])

@router.get("", response_model=CursosResponse)
def get_cursos(
    db: Session = Depends(get_db),
    destacado: Optional[bool] = None,
    tipo_curso: Optional[TipoCurso] = None,
    skip: int = 0,
    limit: int = 100,
):
    """Obtener todos los cursos con filtro opcional de destacado y tipo de curso"""
    query = db.query(Cursos).options(
        joinedload(Cursos.modulos),
        joinedload(Cursos.instituciones),
        joinedload(Cursos.perfiles),
        joinedload(Cursos.profesores),
    )

    if destacado is not None:
        query = query.filter(Cursos.destacado == destacado)
    if tipo_curso is not None:
        query = query.filter(Cursos.tipo_curso == tipo_curso)
    if destacado is True:
        limit = min(limit, 1)

    cursos = query.offset(skip).limit(limit).all()

    total = db.query(Cursos)
    if destacado is not None:
        total = total.filter(Cursos.destacado == destacado)
    if tipo_curso is not None:
        total = total.filter(Cursos.tipo_curso == tipo_curso)
    total = total.count()

    return {"cursos": cursos, "total": total}

@router.get("/slug/{slug}", response_model=CursosOut)
def get_cursos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un curso por slug"""
    db_cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
        )
        .filter(Cursos.slug == slug)
        .first()
    )
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    return db_cursos
