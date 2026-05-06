from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_db
from app.models import Preguntas, Subject
from app.schemas import PreguntasOut, ReporteList

router = APIRouter(prefix="/preguntas", tags=["preguntas-public"])


@router.get("", response_model=ReporteList)
def listar_preguntas(
    db: Session = Depends(get_db),
):
    preguntas = db.execute(select(Preguntas).order_by(Preguntas.fecha.desc())).scalars().all()
    return {
        "preguntas": preguntas,
        "total": len(preguntas),
    }

@router.get("/slug/{slug}", response_model=PreguntasOut)
def get_pregunta_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una pregunta por slug"""
    pregunta = db.execute(select(Preguntas).filter(Preguntas.slug == slug)).scalar_one_or_none()
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    return pregunta