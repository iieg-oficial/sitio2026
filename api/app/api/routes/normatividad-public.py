from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.normatividad import NormatividadResponse
from app.models import Normatividad
from app.api.deps import get_db

router = APIRouter(prefix="/normatividad", tags=["normatividad-public"])

@router.get("/", response_model=NormatividadResponse)
def read_normatividad(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    normatividad = db.query(Normatividad).all()
    return {
        "normatividad": normatividad,
        "total": len(normatividad),
    }
