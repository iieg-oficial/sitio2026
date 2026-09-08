from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Directorio
from app.schemas.directorio import DirectorioOut

router = APIRouter(prefix="/directorio", tags=["directorio - public"])

@router.get("", response_model=List[DirectorioOut])
def list_directorio(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    director: bool | None = None,
):
    """Obtener lista de directorio"""
    directorio = db.query(Directorio)
    if director is not None:
        directorio = directorio.filter(Directorio.director == director)
    return directorio.offset(skip).limit(limit).all()


@router.get("/{directorio_id}", response_model=DirectorioOut)
def get_directorio(
    directorio_id: int,
    db: Session = Depends(get_db),
):
    """Obtener un directorio"""
    directorio = db.query(Directorio).filter(Directorio.id == directorio_id).first()
    if not directorio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Directorio no encontrado")
    return directorio

@router.get("/slug/{slug}", response_model=DirectorioOut)
def get_directorio_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un directorio por slug"""
    directorio = db.query(Directorio).filter(Directorio.slug == slug).first()
    if not directorio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Directorio no encontrado"
        )
    return directorio
