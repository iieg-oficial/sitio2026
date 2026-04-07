from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.valores import ValoresResponse
from app.models import Valores
from app.api.deps import get_db

router = APIRouter(prefix="/valores", tags=["valores-public"])

@router.get("/", response_model=ValoresResponse)
def read_valores(
    db: Session = Depends(get_db),
):
    valores = db.query(Valores).all()
    return {
        "valores": valores,
        "total": len(valores),
    }