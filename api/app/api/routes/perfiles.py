from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_current_user, get_db
from app.models import Perfiles, Usuario
from app.schemas.perfiles import PerfilesCreate, PerfilesResponse, PerfilesOut

router = APIRouter(prefix="/perfiles", tags=["perfiles"])

@router.get("", response_model=PerfilesResponse)
def read_perfiles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los perfiles"""
    perfiles = db.query(Perfiles).all()
    return {
        "perfiles": perfiles,
        "total": len(perfiles),
    }

@router.post("/create", response_model=PerfilesOut)
def create_perfil(
    perfil: PerfilesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crear un nuevo perfil"""
    perfil_db = Perfiles(
        nombre=perfil.nombre,
        descripcion=perfil.descripcion,
        area=perfil.area,
    )
    db.add(perfil_db)
    db.commit()
    db.refresh(perfil_db)
    return perfil_db

@router.put("/{id}", response_model=PerfilesOut)
def update_perfil(
    id: int,
    perfil: PerfilesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un perfil"""
    perfil_db = db.query(Perfiles).filter(Perfiles.id == id).first()
    if not perfil_db:
        raise HTTPException(
            status_code=404, 
            detail="Perfil no encontrado"
        )
    perfil_db.nombre = perfil.nombre
    perfil_db.descripcion = perfil.descripcion
    perfil_db.area = perfil.area
    db.commit()
    db.refresh(perfil_db)
    return perfil_db

@router.delete("/{id}", response_model=PerfilesOut)
def delete_perfil(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un perfil"""
    perfil_db = db.query(Perfiles).filter(Perfiles.id == id).first()
    if not perfil_db:
        raise HTTPException(status_code=404, 
        detail="Perfil no encontrado")
    db.delete(perfil_db)
    db.commit()
    return perfil_db

@router.get("/slug/{slug}", response_model=PerfilesOut)
def get_perfiles_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un perfil por slug"""
    perfil_db = db.query(Perfiles).filter(Perfiles.slug == slug).first()
    if not perfil_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado"
        )
    return perfil_db