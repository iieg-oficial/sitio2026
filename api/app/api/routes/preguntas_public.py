from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Preguntas
from app.schemas import PreguntasListResponse

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