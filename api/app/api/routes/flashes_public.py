from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Flashes    
from app.schemas.flashes import FlashesResponse

router = APIRouter(prefix="/flashes", tags=["flashes-public"])  

@router.get("/", response_model=FlashesResponse)
def read_flashes(
    db: Session = Depends(get_db),
    limit: int = 1,
):
    """Obtener todos los flashes"""
    flashes = db.query(Flashes).all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }