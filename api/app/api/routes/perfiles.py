from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Perfiles, Usuario
from app.schemas.perfiles import PerfilesCreate, PerfilesOut, PerfilesResponse

router = APIRouter(prefix="/perfiles", tags=["perfiles"])

@router.get("/", response_model=PerfilesResponse)
def read_perfiles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los perfiles"""
    perfiles = db.query(Perfiles).all()
    return {
        "perfiles": perfiles,
    }

@router.post("/create", response_model=PerfilesResponse)
def create_perfil(
    perfil: PerfilesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crear un nuevo perfil"""
    perfil_db = Perfiles(**perfil.dict())
    db.add(perfil_db)
    db.commit()
    db.refresh(perfil_db)
    return {
        "perfil": perfil_db,
    }

@router.put("/{id}", response_model=PerfilesResponse)
def update_perfil(
    id: int,
    perfil: PerfilesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un perfil"""
    perfil_db = db.query(Perfiles).filter(Perfiles.id == id).first()
    if not perfil_db:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    perfil_db.nombre = perfil.nombre
    perfil_db.descripcion = perfil.descripcion
    perfil_db.area = perfil.area
    db.commit()
    db.refresh(perfil_db)
    return {
        "perfil": perfil_db,
    }

@router.delete("/{id}", response_model=PerfilesResponse)
def delete_perfil(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un perfil"""
    perfil_db = db.query(Perfiles).filter(Perfiles.id == id).first()
    if not perfil_db:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    db.delete(perfil_db)
    db.commit()
    return {
        "perfil": perfil_db,
    }
