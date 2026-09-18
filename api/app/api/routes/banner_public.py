from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Banner
from app.schemas.banner import BannerOut

router = APIRouter(prefix="/banner", tags=["public - banner"])

@router.get("", response_model=list[BannerOut])
def read_banner(
    db: Session = Depends(get_db),
    limit: int = 5,
):
    """Obtener todos los banners"""
    banners = db.query(Banner).order_by(desc(Banner.id)).limit(limit).all()
    return banners

@router.get("/{slug}", response_model=BannerOut)
def get_banner_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un banner por slug"""
    banner = db.query(Banner).filter(Banner.slug == slug).first()
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner no encontrado",
        )
    return banner
