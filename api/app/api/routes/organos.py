from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Organos, Usuario
from app.schemas.organos import OrganosCreate, OrganosOut, OrganosResponse

router = APIRouter(prefix="/organos", tags=["organos"])


@router.get("", response_model=OrganosResponse)
def read_organos(
    db: Session = Depends(get_db),
):
    """Obtener todos los organos"""
    organos = db.query(Organos).order_by(Organos.id.desc()).all()
    return {"organos": organos, "total": len(organos)}


@router.post("/create", response_model=OrganosOut, status_code=status.HTTP_201_CREATED)
def create_organos(
    organos: OrganosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Crear un nuevo organo"""
    slug = slugify(organos.titulo)
    base_slug = slug
    contador = 1
    while db.query(Organos).filter(Organos.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    db_organos = Organos(
        titulo=organos.titulo,
        descripcion=organos.descripcion,
        link=organos.link,
        slug=slug,
    )
    db.add(db_organos)
    db.commit()
    db.refresh(db_organos)
    return db_organos


@router.patch("/{id}", response_model=OrganosOut)
def update_organos(
    id: int,
    organos: OrganosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un organo"""
    db_organos = db.query(Organos).filter(Organos.id == id).first()
    if not db_organos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organo no encontrado",
        )
    update_data = organos.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_organos.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Organos).filter(Organos.slug == slug, Organos.id != id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Organos, update_data["slug"], exclude_id=id
            )
        else:
            del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(db_organos, campo, valor)

    db.commit()
    db.refresh(db_organos)
    return db_organos


@router.delete("/{id}")
def delete_organos(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un organo"""
    db_organos = db.query(Organos).filter(Organos.id == id).first()
    if not db_organos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organo no encontrado",
        )
    db.delete(db_organos)
    db.commit()
    return {"message": "Organo eliminado correctamente"}


@router.get("/slug/{slug}", response_model=OrganosOut)
def get_organos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un organo por slug"""
    db_organos = db.query(Organos).filter(Organos.slug == slug).first()
    if not db_organos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organo no encontrado",
        )
    return db_organos