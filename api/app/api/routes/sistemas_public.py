from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models import Sistemas
from app.schemas.sistemas import SistemasResponse, SistemasOut

router = APIRouter(prefix="/sistemas", tags=["sistemas-public"])

@router.get("", response_model=SistemasResponse)
def read_sistemas(
    db: Session = Depends(get_db),
):
    """Obtener todos los sistemas"""
    sistemas = db.query(Sistemas).all()
    return {
        "sistemas": sistemas,
        "total": len(sistemas),
    }

@router.get("/slug/{slug}", response_model=SistemasResponse)
def get_sistemas_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un sistema por slug"""
    sistema = db.query(Sistemas).filter(Sistemas.slug == slug).first()
    if not sistema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sistema no encontrado"
        )
    return sistema