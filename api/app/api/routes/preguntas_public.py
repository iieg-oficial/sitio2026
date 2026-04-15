from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Preguntas
from app.schemas import PreguntasResponse

router = APIRouter(prefix="/preguntas", tags=["preguntas-public"])

@router.get("", response_model=list[PreguntasResponse])
def listar_preguntas(
    db: Session = Depends(get_db),
):
    preguntas = db.query(Preguntas).all()
    return preguntas