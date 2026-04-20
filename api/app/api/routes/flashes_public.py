from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Flashes    
from app.schemas.flashes import FlashesResponse

router = APIRouter(prefix="/flashes", tags=["flashes-public"])  


@router.get("/", response_model=FlashesResponse)
def read_flashes(
    db: Session = Depends(get_db),
):
    """Obtener todos los flashes"""
    flashes = db.query(Flashes).options(joinedload(Flashes.subject)).all()
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
    flashes = db.query(Flashes).order_by(Flashes.id.desc()).limit(limit).all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }