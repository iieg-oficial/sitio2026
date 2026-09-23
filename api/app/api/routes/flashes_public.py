from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Flashes
from app.schemas.flashes import FlashesList, FlashesOut

router = APIRouter(prefix="/flashes", tags=["flashes-public"])


@router.get("", response_model=FlashesList)
def read_flashes(
    response: Response,
    db: Session = Depends(get_db),
):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    
    flashes = db.execute(
        select(Flashes)
        .options(joinedload(Flashes.temas))
        .order_by(Flashes.id.desc())
    ).scalars().unique().all()

    return {
        "flashes": flashes,
        "total": len(flashes),
    }

@router.get("/last", response_model=list[FlashesOut])
def read_last_flashes(
    response: Response,
    db: Session = Depends(get_db),
    limit: int = 1,
):
    """Obtener el ultimo flash"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    
    flashes = db.execute(
        select(Flashes)
        .options(joinedload(Flashes.temas))
        .order_by(Flashes.id.desc())
        .limit(limit)
    ).scalars().unique().all()
    return flashes

@router.get("/slug/{slug}", response_model=FlashesOut)
def get_flashes_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un flash por slug"""
    flash = db.execute(
        select(Flashes)
        .options(joinedload(Flashes.temas))
        .where(Flashes.slug == slug)
    ).scalars().first()
    
    if not flash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flash no encontrado"
        )
    return flash
