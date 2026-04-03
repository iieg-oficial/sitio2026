from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Mapa, Usuario     
from app.schemas.mapa import MapaOut, MapaResponse, MapaCreate

router = APIRouter(prefix="/mapas", tags=["mapa"])

@router.get("/", response_model=MapaResponse)
def read_mapa(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los mapas"""
    mapas = db.query(Mapa).all()
    return {
        "mapas": mapas,
        "total": len(mapas),
    }   

@router.post("/create", response_model=MapaOut)
def create_mapa(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    mapa: MapaCreate = None,
):
    """Crear un nuevo mapa"""
    db_mapa = Mapa(**mapa.dict())
    db.add(db_mapa)
    db.commit()
    db.refresh(db_mapa)
    return db_mapa

@router.put("/{id}", response_model=MapaOut)
def update_mapa(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    mapa: MapaCreate = None,
):
    """Actualizar un mapa"""
    db_mapa = db.query(Mapa).filter(Mapa.id == id).first()
    if not db_mapa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapa no encontrado",
        )
    for key, value in mapa.dict().items():
        setattr(db_mapa, key, value)
    db.commit()
    db.refresh(db_mapa)
    return db_mapa

@router.delete("/{id}", response_model=MapaOut)
def delete_mapa(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un mapa"""
    db_mapa = db.query(Mapa).filter(Mapa.id == id).first()
    if not db_mapa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapa no encontrado",
        )
    db.delete(db_mapa)
    db.commit()
    return db_mapa