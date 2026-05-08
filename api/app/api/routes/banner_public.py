from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models import Banner
from app.schemas.banner import BannerOut, BannerResponse

router = APIRouter(prefix="/banner", tags=["public - banner"])

@router.get("/", response_model=BannerResponse)
def read_banner(
    db: Session = Depends(get_db),
):
    """Obtener todos los banners"""
    banner = db.query(Banner).all()
    return {
        "banners": banner,
        "total": len(banner),
    }

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