from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Plataformas
from app.schemas.plataformas import PlataformasResponse

router = APIRouter(prefix="/plataformas", tags=["plataformas"])

@router.get("/", response_model=list[PlataformasResponse])
def list_plataformas(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    destacado: bool | None = None,
):
    """Obtener lista de plataformas"""
    query = db.query(Plataformas)
    if destacado is not None:
        query = query.filter(Plataformas.destacada == destacado)
    plataformas = query.offset(skip).limit(limit).all()
    return plataformas

@router.get("/{plataforma_id}", response_model=PlataformasResponse)
def get_plataforma(
    plataforma_id: int,
    db: Session = Depends(get_db),
):
    """Obtener una plataforma por ID"""
    plataforma = db.query(Plataformas).filter(Plataformas.id == plataforma_id).first()
    if not plataforma:
        raise HTTPException(status_code=404, detail="Plataforma no encontrada")
    return plataforma