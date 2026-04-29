from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models.profesores import Profesores
from app.schemas.profesores import ProfesoresOut, ProfesoresResponse

router = APIRouter(prefix="/profesores", tags=["profesores public"])

@router.get("", response_model=list[ProfesoresResponse])
async def listar_profesores(db: Session = Depends(get_db)):
    profesores = db.query(Profesores).all()
    return {
        "profesores": profesores,
        "total": len(profesores)
    }

@router.get("/{profesor_id}", response_model=ProfesoresOut)
async def obtener_profesor(profesor_id: int, db: Session = Depends(get_db)):
    profesor = db.query(Profesores).filter(Profesores.id == profesor_id).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    return profesor

@router.get("/slug/{slug}", response_model=ProfesoresOut)
def get_profesor_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un profesor por slug"""
    profesor = db.query(Profesores).filter(Profesores.slug == slug).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    return profesor