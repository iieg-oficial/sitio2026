from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models import Perfiles
from app.schemas.perfiles import PerfilesResponse, PerfilesOut

router = APIRouter(prefix="/perfiles", tags=["perfiles - public"])

@router.get("", response_model=PerfilesResponse)
def read_perfiles(
    db: Session = Depends(get_db),
):
    """Obtener todos los perfiles"""
    perfiles = db.query(Perfiles).all()
    return {
        "perfiles": perfiles,
        "total": len(perfiles),
    }

@router.get("/slug/{slug}", response_model=PerfilesOut)
def get_perfiles_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un perfil por slug"""
    perfil = db.query(Perfiles).filter(Perfiles.slug == slug).first()
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado"
        )
    return perfil