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
    destacado: Optional[bool] = Query(default=None, description="Destacado"),
    tipo_curso: Optional[str] = Query(default=None, description="Tipo de curso"),
):
    """Obtener todos los cursos"""
    query = db.query(Cursos).options(
        joinedload(Cursos.profesores), 
        joinedload(Cursos.modulos), 
        joinedload(Cursos.perfiles), 
        joinedload(Cursos.instituciones)
    )

    if destacado is not None:
        query = query.filter(Cursos.destacado == destacado)
    if tipo_curso is not None:
        query = query.filter(Cursos.tipo_curso == tipo_curso)

    cursos = query.all()
    return {
        "cursos": cursos,
        "total": len(cursos),
    }

@router.get("/{slug}", response_model=CursosOut)
def get_cursos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un curso por slug"""
    db_cursos = db.query(Cursos).filter(Cursos.slug == slug).first()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    return db_cursos