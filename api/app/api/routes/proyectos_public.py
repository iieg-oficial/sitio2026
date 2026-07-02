from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models import Proyectos
from app.schemas.proyectos import ProyectosOut, ProyectosResponse

router = APIRouter(prefix="/proyectos", tags=["proyectos publicos"])

@router.get("", response_model=ProyectosResponse)
async def listar_proyectos_publicos(
    db: Session = Depends(get_db),
):
    proyectos = db.query(Proyectos).all()
    return {
        "proyectos": proyectos,
        "total": len(proyectos),
    }

@router.get("/{proyecto_id}", response_model=ProyectosOut)
async def obtener_proyecto_publico(
    proyecto_id: int,
    db: Session = Depends(get_db),
):
    proyecto = db.query(Proyectos).filter(Proyectos.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )
    return proyecto

@router.get("/slug/{slug}", response_model=ProyectosOut)
def get_proyecto_publico_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un proyecto público por slug"""
    proyecto = db.query(Proyectos).filter(Proyectos.slug == slug).first()
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )
    return proyecto