from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Flashes, Usuario     
from app.schemas.flashes import FlashesResponse

router = APIRouter(prefix="/flashes", tags=["flashes-public"])  

@router.get("/", response_model=FlashesResponse)
def read_flashes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los flashes"""
    flashes = db.query(Flashes).all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }