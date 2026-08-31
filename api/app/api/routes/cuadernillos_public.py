from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models import Cuadernillo
from app.schemas import CuadernilloOut, CuadernilloResponse

router = APIRouter(prefix="/cuadernillos", tags=["public - cuadernillos"])

@router.get("", response_model=CuadernilloResponse)
def read_cuadernillos(
    db: Session = Depends(get_db),
    order_by: str = "anyo",
    skip: int = 0,
):
    """Obtener todos los cuadernillos"""
    cuadernillos = db.query(Cuadernillo).order_by(Cuadernillo.anyo.desc()).offset(skip).all()

    return {
        "cuadernillos": cuadernillos,
        "total": len(cuadernillos),
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