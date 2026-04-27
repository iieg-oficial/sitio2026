from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.api.deps import get_db
from app.models import Cursos
from app.schemas.cursos import CursosOut, CursosResponse

router = APIRouter(prefix="/cursos-public", tags=["cursos-public"])

@router.get("/", response_model=CursosResponse)
def get_cursos(
    db: Session = Depends(get_db),
):
    """Obtener todos los cursos con sus relaciones"""
    cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
        )
        .all()
    )
    return {"cursos": cursos, "total": len(cursos)}

@router.get("/{slug}", response_model=CursosOut)
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