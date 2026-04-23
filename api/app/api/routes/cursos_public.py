from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Cursos, Usuario, Modulos, Instituciones, Perfiles, Profesores
from app.schemas.cursos import CursosOut, CursosResponse

router = APIRouter(prefix="/cursos-public", tags=["cursos-public"])

@router.get("/", response_model=CursosResponse)
def get_cursos(
    db: Session = Depends(get_db),
    destacado: bool | None = None,
):
    """Obtener todos los cursos"""
    query = db.query(Cursos).options(joinedload(Cursos.profesores), joinedload(Cursos.modulos), joinedload(Cursos.perfiles), joinedload(Cursos.instituciones))
    if destacado is not None:
        query = query.filter(Cursos.destacado == destacado)
    cursos = query.all()
    return {
        "cursos": cursos,
        "total": len(cursos),
    }