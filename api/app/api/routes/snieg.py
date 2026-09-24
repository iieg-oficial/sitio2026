from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Snieg, Usuario
from app.schemas.snieg import SniegCreate, SniegOut, SniegResponse

router = APIRouter(prefix="/snieg", tags=["snieg"])


@router.get("", response_model=SniegResponse)
def read_snieg(
    db: Session = Depends(get_db),
):
    """Obtener todos los registros de Snieg"""
    snieg = db.query(Snieg).order_by(Snieg.id.desc()).all()
    return {
        "snieg": snieg,
        "total": len(snieg),
    }


@router.get("/slug/{slug}", response_model=SniegOut)
def get_snieg_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un registro por slug (se declara ANTES de /{id} para evitar colisión de rutas)"""
    snieg = db.query(Snieg).filter(Snieg.slug == slug).first()
    if not snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snieg no encontrado"
        )
    return snieg


@router.get("/{id}", response_model=SniegOut)
def get_snieg_id(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener un registro por ID"""
    snieg = db.query(Snieg).filter(Snieg.id == id).first()
    if not snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snieg no encontrado"
        )
    return snieg


@router.post("/create", response_model=SniegOut, status_code=status.HTTP_201_CREATED)
def create_snieg(
    snieg: SniegCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Crear un nuevo registro"""
    slug = make_unique_slug(db, Snieg, snieg.titulo)

    db_snieg = Snieg(
        titulo=snieg.titulo,
        descripcion=snieg.descripcion,
        imagen=snieg.imagen,
        enlace=snieg.enlace,
        slug=slug,
    )
    db.add(db_snieg)
    db.commit()
    db.refresh(db_snieg)
    return db_snieg


@router.patch("/{id}", response_model=SniegOut)
def update_snieg(
    id: int,
    snieg: SniegCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un registro existente"""
    db_snieg = db.query(Snieg).filter(Snieg.id == id).first()
    if not db_snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Snieg no encontrado",
        )

    update_data = snieg.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_snieg.titulo:
        update_data["slug"] = make_unique_slug(
            db, Snieg, update_data["titulo"], exclude_id=id
        )
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Snieg, update_data["slug"], exclude_id=id
            )
        else:
            del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(db_snieg, campo, valor)

    db.commit()
    db.refresh(db_snieg)
    return db_snieg


@router.delete("/{id}")
def delete_snieg(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un registro"""
    db_snieg = db.query(Snieg).filter(Snieg.id == id).first()
    if not db_snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Snieg no encontrado",
        )
    db.delete(db_snieg)
    db.commit()
    return {"message": "Snieg eliminado correctamente"}