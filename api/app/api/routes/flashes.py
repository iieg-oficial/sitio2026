from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Flashes, Usuario     
from app.schemas.flashes import FlashesOut, FlashesResponse, FlashesCreate

router = APIRouter(prefix="/flashes", tags=["flashes"])  

@router.get("/", response_model=FlashesResponse)
def read_flashes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los flashes"""
    flashes = db.query(Flashes).all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }

@router.post("/create", response_model=FlashesOut)
def create_flashes(
    flashes: FlashesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crear un nuevo flash"""
    db_flashes = Flashes(
        titulo=flashes.titulo,
        desc_jal=flashes.desc_jal,
        desc_nac=flashes.desc_nac,
        periocidad=flashes.periocidad,
        fecha_publicacion=flashes.fecha_publicacion,
        fuente=flashes.fuente,
        link=flashes.link,
    )
    db.add(db_flashes)
    db.commit()
    db.refresh(db_flashes)
    return db_flashes

@router.put("/{id}", response_model=FlashesOut)
def update_flashes(
    id: int,
    flashes: FlashesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un flash"""
    db_flashes = db.query(Flashes).filter(Flashes.id == id).first()
    if not db_flashes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    db_flashes.titulo = flashes.titulo
    db_flashes.desc_jal = flashes.desc_jal
    db_flashes.desc_nac = flashes.desc_nac
    db_flashes.periocidad = flashes.periocidad
    db_flashes.fecha_publicacion = flashes.fecha_publicacion
    db_flashes.fuente = flashes.fuente
    db_flashes.link = flashes.link
    db.commit()
    db.refresh(db_flashes)
    return db_flashes

@router.delete("/{id}", response_model=FlashesOut)
def delete_flashes( 
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un flash"""
    db_flashes = db.query(Flashes).filter(Flashes.id == id).first()
    if not db_flashes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    db.delete(db_flashes)
    db.commit()
    return db_flashes

