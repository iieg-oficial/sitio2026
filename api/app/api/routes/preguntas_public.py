from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from slugify import slugify
from app.api.deps import get_db
from app.models import Preguntas
from app.schemas import PreguntasListResponse, PreguntasOut

router = APIRouter(prefix="/preguntas", tags=["preguntas-public"])


@router.get("", response_model=PreguntasListResponse)
def listar_preguntas(
    db: Session = Depends(get_db),
):
    preguntas = db.query(Preguntas).options(joinedload(Preguntas.subject)).all()
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
    pregunta = db.query(Preguntas).filter(Preguntas.slug == slug).first()
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    return pregunta