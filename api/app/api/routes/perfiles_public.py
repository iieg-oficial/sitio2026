from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Perfiles
from app.schemas.perfiles import PerfilesResponse

router = APIRouter(prefix="/perfiles", tags=["perfiles"])

@router.get("/", response_model=PerfilesResponse)
def read_perfiles(
    db: Session = Depends(get_db),
):
    """Obtener todos los perfiles"""
    perfiles = db.query(Perfiles).all()
    return {
        "perfiles": perfiles,
    }