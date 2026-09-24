from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Perfiles, Usuario
from app.schemas.perfiles import PerfilesCreate, PerfilesOut, PerfilesResponse

router = APIRouter(prefix="/perfiles", tags=["perfiles"])


@router.get("", response_model=PerfilesResponse)
def read_perfiles(
    db: Session = Depends(get_db),
):
    """Obtener todos los perfiles"""
    perfiles = db.query(Perfiles).order_by(Perfiles.id.desc()).all()
    return {
        "perfiles": perfiles,
        "total": len(perfiles),
    }


@router.get("/slug/{slug}", response_model=PerfilesOut)
def get_perfiles_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un perfil por slug (se coloca ANTES de /{id} para evitar colisión)"""
    perfil_db = db.query(Perfiles).filter(Perfiles.slug == slug).first()
    if not perfil_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado"
        )
    return perfil_db


@router.get("/{id}", response_model=PerfilesOut)
def get_perfil_id(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener un perfil por ID"""
    perfil_db = db.query(Perfiles).filter(Perfiles.id == id).first()
    if not perfil_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado"
        )
    return perfil_db


@router.post("/create", response_model=PerfilesOut, status_code=status.HTTP_201_CREATED)
def create_perfil(
    perfil: PerfilesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Crear un nuevo perfil"""
    slug = make_unique_slug(db, Perfiles, perfil.nombre)

    perfil_db = Perfiles(
        nombre=perfil.nombre,
        descripcion=perfil.descripcion,
        area=perfil.area,
        slug=slug,
    )
    db.add(perfil_db)
    db.commit()
    db.refresh(perfil_db)
    return perfil_db


@router.patch("/{id}", response_model=PerfilesOut)
def update_perfil(
    id: int,
    perfil: PerfilesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un perfil"""
    perfil_db = db.query(Perfiles).filter(Perfiles.id == id).first()
    if not perfil_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado"
        )

    update_data = perfil.model_dump(exclude_unset=True)

    if "nombre" in update_data and update_data["nombre"] != perfil_db.nombre:
        update_data["slug"] = make_unique_slug(
            db, Perfiles, update_data["nombre"], exclude_id=id
        )
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Perfiles, update_data["slug"], exclude_id=id
            )
        else:
            del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(perfil_db, campo, valor)

    db.commit()
    db.refresh(perfil_db)
    return perfil_db


@router.delete("/{id}", response_model=PerfilesOut)
def delete_perfil(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un perfil"""
    perfil_db = db.query(Perfiles).filter(Perfiles.id == id).first()
    if not perfil_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado"
        )
    db.delete(perfil_db)
    db.commit()
    return perfil_db