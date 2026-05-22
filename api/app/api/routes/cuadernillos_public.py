from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models import Cuadernillo
from app.schemas import CuadernilloOut, CuadernilloResponse

router = APIRouter(prefix="/cuadernillos", tags=["public - cuadernillos"])

@router.get("", response_model=CuadernilloResponse)
def read_cuadernillos(
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0,
):
    """Obtener todos los cuadernillos"""
    cuadernillos = db.query(Cuadernillo).offset(offset).limit(limit).all()
    total = db.query(Cuadernillo).count()
    return {
        "cuadernillos": cuadernillos,
        "total": total,
    }

@router.get("/{slug}", response_model=CuadernilloOut)
def get_cuadernillo_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un cuadernillo por slug"""
    cuadernillo = db.query(Cuadernillo).filter(Cuadernillo.slug == slug).first()
    if not cuadernillo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuadernillo no encontrado",
        )
    return cuadernillo