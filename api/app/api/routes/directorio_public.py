from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Directorio
from app.schemas.directorio import DirectorioResponse

router = APIRouter(prefix="/directorio", tags=["directorio-public"])

@router.get("/", response_model=DirectorioResponse)
def list_directorio(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    director: bool | None = None,
):
    """Obtener lista de directorio"""
    directorio = db.query(Directorio).offset(skip).limit(limit).all()
    return directorio


@router.get("/{directorio_id}", response_model=DirectorioResponse)
def get_directorio(
    directorio_id: int,
    db: Session = Depends(get_db),
):
    """Obtener un directorio"""
    directorio = db.query(Directorio).filter(Directorio.id == directorio_id).first()
    if not directorio:
        raise HTTPException(status_code=404, detail="Directorio no encontrado")
    return directorio