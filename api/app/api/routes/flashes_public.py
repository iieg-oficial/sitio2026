from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_db
from app.models import Flashes, Subject
from app.schemas.flashes import FlashesResponse, FlashesOut, FlashesList

router = APIRouter(prefix="/flashes", tags=["flashes-public"])  


@router.get("", response_model=FlashesResponse)
def read_flashes(
    db: Session = Depends(get_db),
):
    """Obtener todos los flashes"""
    flashes = db.execute(select(Flashes)).scalars().all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }

@router.get("/last", response_model=FlashesResponse)
def read_last_flashes(
    db: Session = Depends(get_db),
    limit: int = 1,
):
    """Obtener el ultimo flash"""
    flashes = db.execute(select(Flashes).order_by(Flashes.id.desc()).limit(limit)).scalars().all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }

@router.get("/slug/{slug}", response_model=FlashesOut)
def get_flashes_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un flash por slug"""
    flash = db.execute(select(Flashes).where(Flashes.slug == slug)).scalar_one_or_none()
    if not flash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flash no encontrado"
        )
    return flash