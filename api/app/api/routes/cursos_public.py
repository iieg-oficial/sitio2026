from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Cursos
from app.schemas.cursos import CursosResponse

router = APIRouter(prefix="/cursos-public", tags=["cursos-public"])

@router.get("/", response_model=CursosResponse)
def read_cursos(
    db: Session = Depends(get_db),
    destacado: bool | None = None,
):
    """Obtener todos los cursos"""
    query = db.query(Cursos).options(joinedload(Cursos.profesor), joinedload(Cursos.modulo), joinedload(Cursos.perfil), joinedload(Cursos.institucion))
    if destacado is not None:
        query = query.filter(Cursos.destacado == destacado)
    cursos = query.all()
    return {
        "cursos": cursos,
        "total": len(cursos),
    }