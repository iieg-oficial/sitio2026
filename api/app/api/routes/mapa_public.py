from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

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
):
    """Obtener un mapa aleatorio"""
    mapa = db.query(Mapa).order_by(func.random()).first()

    if not mapa:
        raise HTTPException(status_code=404, detail="No hay mapas disponibles")

    return mapa