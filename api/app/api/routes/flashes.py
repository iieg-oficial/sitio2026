from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import DatosNuevos, Usuario     
from app.schemas.flashes import FlashesOut, FlashesResponse, FlashesCreate

router = APIRouter(prefix="/flashes", tags=["flashes"])  

@router.get("/", response_model=FlashesResponse)
def read_flashes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los flashes"""
    flashes = db.query(DatosNuevos).all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }

@router.post("/create", response_model=FlashesCreate)
def create_flashes(
    flashes: FlashesCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Crear un nuevo flash"""
    db_flashes = DatosNuevos(
        numero=flashes.numero,
        descripcion=flashes.descripcion,
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
    current_user=Depends(verify_csrf),
):
    """Actualizar un flash"""
    db_flashes = db.query(DatosNuevos).filter(DatosNuevos.id == id).first()
    if not db_flashes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    db_flashes.numero = flashes.numero
    db_flashes.descripcion = flashes.descripcion
    db.commit()
    db.refresh(db_flashes)
    return db_flashes

@router.delete("/{id}", response_model=FlashesOut)
def delete_flashes( 
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Eliminar un flash"""
    db_flashes = db.query(DatosNuevos).filter(DatosNuevos.id == id).first()
    if not db_flashes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    db.delete(db_flashes)
    db.commit()
    return db_flashes

