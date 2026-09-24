from fastapi import APIRouter, Depends, HTTPException, status

# pyrefly: ignore [missing-import]
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Sistemas, Subject
from app.schemas.sistemas import SistemasList, SistemasOut

router = APIRouter(prefix="/sistemas", tags=["sistemas-public"])

def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

@router.get("", response_model=SistemasList)
def read_sistemas(
    db: Session = Depends(get_db),
    destacado: bool | None = None,
    slider: bool | None = None,
    skip: int = 0,
    limit: int = 100,
):
    """Obtener todos los sistemas con filtro opcional de destacado"""
    query = select(Sistemas)
    if destacado is not None:
        query = query.where(Sistemas.destacado == destacado)
    if slider is not None:
        query = query.where(Sistemas.slider == slider)

    sistemas = db.execute(query.offset(skip).limit(limit)).scalars().all()
    total = db.query(Sistemas)

    if destacado is not None:
        total = total.filter(Sistemas.destacado == destacado)
    if slider is not None:
        total = total.filter(Sistemas.slider == slider)
    total = total.count()

    return {
        "sistemas": sistemas,
        "total": total,
    }


@router.get("/destacados", response_model=SistemasList)
def read_sistemas_destacados(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 4,
):
    """Obtener todos los sistemas destacados"""
    sistemas = db.query(Sistemas).filter(Sistemas.destacado).offset(skip).limit(limit).all()
    total = db.query(Sistemas).filter(Sistemas.destacado).count()
    return {
        "sistemas": sistemas,
        "total": total,
    }

@router.get("/{id}", response_model=SistemasOut)
def get_sistemas_id(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener un sistema por ID"""
    db_sistemas = db.get(Sistemas, id)
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    return db_sistemas

@router.get("/slug/{slug}", response_model=SistemasOut)
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
