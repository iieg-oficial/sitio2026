from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Modulos, Usuario
from app.schemas.modulos import ModulosCreate, ModulosOut, ModulosResponse

router = APIRouter(prefix="/modulos", tags=["modulos"])

@router.get("", response_model=ModulosResponse)
def read_modulo(   
    db: Session = Depends(get_db),
):
    """Obtener todos los modulos"""
    modulos = db.query(Modulos).all()
    return {
        "modulos": modulos,
        "total": len(modulos),
    }

@router.get("/{id}", response_model=ModulosOut)
def read_modulo_by_id(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener un modulo por id"""
    db_modulo = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    return db_modulo

@router.post("/create", response_model=ModulosOut, status_code=status.HTTP_201_CREATED)
def create_modulo(
    modulo: ModulosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(modulo.nombre)
    base_slug = slug
    contador = 1
    while db.query(Modulos).filter(Modulos.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    """Crear un nuevo modulo"""
    db_modulo = Modulos(
        nombre=modulo.nombre,
        descripcion=modulo.descripcion,
        slug=slug,
    )
    db.add(db_modulo)
    db.commit()
    db.refresh(db_modulo)
    return db_modulo

@router.patch("/{id}", response_model=ModulosOut)
def update_modulo(
    id: int,
    modulo: ModulosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un modulo"""
    db_modulo = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    
    update_data = modulo.model_dump(exclude_unset=True)

    if "nombre" in update_data and update_data["nombre"] != db_modulo.nombre:
        slug = slugify(update_data["nombre"])
        base_slug = slug
        contador = 1
        while db.query(Modulos).filter(Modulos.slug == slug, Modulos.id != id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(db_modulo, campo, valor)
    db.commit()
    db.refresh(db_modulo)
    return db_modulo

@router.delete("/{id}", response_model=ModulosOut)
def delete_modulo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un modulo"""
    db_modulo = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    db.delete(db_modulo)
    db.commit()
    return db_modulo

@router.get("/slug/{slug}", response_model=ModulosOut)
def get_modulos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un modulo por slug"""
    db_modulo = db.query(Modulos).filter(Modulos.slug == slug).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    return db_modulo