from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.schemas.valores import ValoresResponse
from app.models import Valores
from app.api.deps import get_db

router = APIRouter(prefix="/valores", tags=["valores"])

@router.get("/", response_model=list[ValoresResponse])
def read_valores(
    db: Session = Depends(get_db)
    ):
    valores = db.query(Valores).all()
    return valores