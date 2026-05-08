from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from slugify import slugify
from app.api.deps import get_db
from app.models import Mapa     
from app.schemas.mapa import MapaResponse, MapaOut

router = APIRouter(prefix="/mapas", tags=["mapa-public"])

@router.get("/", response_model=MapaResponse)
def read_mapas(
    db: Session = Depends(get_db),
):
    """Obtener todos los mapas"""
    mapas = db.query(Mapa).all()
    return {
        "mapas": mapas,
        "total": len(mapas),
    }   


@router.get("/random", response_model=MapaOut)
def read_mapa_random(
    db: Session = Depends(get_db),
    limit: int = 3,
):
    """Obtener un mapa aleatorio"""
    mapa = db.query(Mapa).order_by(func.random()).limit(limit).all()

    if not mapa:
        raise HTTPException(status_code=404, detail="No hay mapas disponibles")

    return mapa

@router.get("/slug/{slug}", response_model=MapaOut)
def get_mapa_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un mapa por slug"""
    mapa = db.query(Mapa).filter(Mapa.slug == slug).first()
    if not mapa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mapa no encontrado"
        )
    return mapa