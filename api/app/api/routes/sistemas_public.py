from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Sistemas
from app.schemas.sistemas import SistemasResponse

router = APIRouter(prefix="/sistemas", tags=["sistemas-public"])

@router.get("/", response_model=SistemasResponse)
def read_sistemas(
    db: Session = Depends(get_db),
):
    """Obtener todos los sistemas"""
    sistemas = db.query(Sistemas).options(joinedload(Sistemas.tipo)).all()
    return {
        "sistemas": sistemas,
        "total": len(sistemas),
    }