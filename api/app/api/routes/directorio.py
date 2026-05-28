from typing import List
from slugify import slugify
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Directorio, Usuario
from app.schemas.directorio import DirectorioCreate, DirectorioOut

router = APIRouter(prefix="/directorio", tags=["directorio"])

@router.get("/", response_model=List[DirectorioOut])
def list_directorio(
    db: Session = Depends(get_db),
):
    """Obtener lista de directorio"""
    directorio = db.query(Directorio).all()
    return directorio

@router.post("/create", response_model=DirectorioOut)
def create_directorio(
    directorio: DirectorioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(directorio.nombre)
    base_slug = slug
    contador = 1
    while db.query(Directorio).filter(Directorio.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    """Crear un nuevo directorio"""
    db_directorio = Directorio(
        nombre=directorio.nombre,
        cargo=directorio.cargo,
        director=directorio.director,
        telefono=directorio.telefono,
        email=directorio.email,
        slug=slug,
    )
    db.add(db_directorio)
    db.commit()
    db.refresh(db_directorio)
    return db_directorio

@router.put("/{directorio_id}", response_model=DirectorioOut)
def update_directorio(
    directorio_id: int,
    directorio: DirectorioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un directorio"""
    db_directorio = db.query(Directorio).filter(Directorio.id == directorio_id).first()
    if not db_directorio:
        raise HTTPException(status_code=404, detail="Directorio no encontrado")

    update_data = directorio.model_dump(exclude_unset=True)

    if "nombre" in update_data and update_data["nombre"] != db_directorio.nombre:
        slug = slugify(update_data["nombre"])
        base_slug = slug
        contador = 1
        while db.query(Directorio).filter(Directorio.slug == slug, Directorio.id != directorio_id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(db_directorio, campo, valor)

    db.commit()
    db.refresh(db_directorio)
    return db_directorio

@router.delete("/{directorio_id}")
def delete_directorio(
    directorio_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un directorio"""
    db_directorio = db.query(Directorio).filter(Directorio.id == directorio_id).first()
    if not db_directorio:
        raise HTTPException(status_code=404, detail="Directorio no encontrado")
    db.delete(db_directorio)
    db.commit()
    return {"message": "Directorio eliminado exitosamente"}

@router.get("/slug/{slug}", response_model=DirectorioOut)
def get_directorio_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un directorio por slug"""
    directorio = db.query(Directorio).filter(Directorio.slug == slug).first()
    if not directorio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Directorio no encontrado"
        )
    return directorio