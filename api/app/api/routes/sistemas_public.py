from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_db
from app.models import Sistemas
from app.schemas.sistemas import SistemasResponse, SistemasOut

router = APIRouter(prefix="/sistemas", tags=["sistemas-public"])

@router.get("", response_model=SistemasResponse)
def read_sistemas(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    destacado: bool | None = None,
):
    """Obtener todos los sistemas"""
    sistemas = db.query(Sistemas)
    if destacado is not None:
        sistemas = sistemas.filter(Sistemas.destacado == destacado)
    sistemas = sistemas.offset(skip).limit(limit).all()
    total = db.query(Sistemas).count()
    return {
        "sistemas": sistemas,
        "total": total,
    }

@router.get("/destacados", response_model=SistemasResponse)
def read_sistemas_destacados(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 4,
):
    """Obtener todos los sistemas destacados"""
    sistemas = db.query(Sistemas).filter(Sistemas.destacado == True).offset(skip).limit(limit).all()
    total = db.query(Sistemas).filter(Sistemas.destacado == True).count()
    return {
        "sistemas": sistemas,
        "total": total,
    }

@router.get("/{id}", response_model=SistemasResponse)
def read_sistemas_plataforma(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener todos los sistemas de una plataforma"""
    sistemas = db.execute(select(Sistemas).filter(Sistemas.plataforma_id == id)).scalars().all()
    total = db.execute(select(Sistemas).filter(Sistemas.plataforma_id == id).count()).scalar_one()
    return {
        "sistemas": sistemas,
        "total": total,
    }

@router.get("/slug/{slug}", response_model=SistemasResponse)
def get_sistemas_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un sistema por slug"""
    sistema = db.query(Sistemas).filter(Sistemas.slug == slug).first()
    if not sistema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sistema no encontrado"
        )
    return sistema