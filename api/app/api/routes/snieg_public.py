from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from slugify import slugify
from app.schemas.snieg import SniegResponse, SniegOut
from app.models import Snieg
from app.api.deps import get_db

router = APIRouter(prefix="/snieg", tags=["snieg - public"])

@router.get("", response_model=SniegResponse)
def read_snieg(
    db: Session = Depends(get_db),
    ):
    snieg = db.query(Snieg).order_by(Snieg.id.asc()).all()
    return {
        "snieg": snieg,
        "total": len(snieg),
    }

@router.get("/slug/{slug}", response_model=SniegResponse)
def get_snieg_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un snieg por slug"""
    snieg = db.query(Snieg).filter(Snieg.slug == slug).first()
    if not snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snieg no encontrado"
        )
    return snieg