from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Banner, Usuario
from app.schemas.banner import (
    BannerCreate,
    BannerOrdenItem,
    BannerOut,
    BannerResponse,
    BannerUpdate,
)

router = APIRouter(prefix="/banner", tags=["banner"])


@router.get("/", response_model=BannerResponse)
def read_banner(
    db: Session = Depends(get_db),
):
    """Obtener todos los banners ordenados por posición"""
    banners = db.query(Banner).order_by(Banner.orden.asc(), Banner.id.desc()).all()
    return {
        "banners": banners,
        "total": len(banners),
    }


@router.post("/create", response_model=BannerOut, status_code=status.HTTP_201_CREATED)
def create_banner(
    banner: BannerCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Crear un nuevo banner asignándolo al final del orden"""
    slug = slugify(banner.titulo)
    base_slug = slug
    contador = 1
    while db.query(Banner).filter(Banner.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    # Calcular la siguiente posición disponible
    max_orden = db.query(func.max(Banner.orden)).scalar()
    siguiente_orden = (max_orden + 1) if max_orden is not None else 0

    db_banner = Banner(
        titulo=banner.titulo,
        descripcion=banner.descripcion,
        imagen_desktop=banner.imagen_desktop,
        imagen_mobile=banner.imagen_mobile,
        imagen=banner.imagen,
        link=banner.link,
        boton=banner.boton,
        color_fondo=banner.color_fondo,
        full_screen=banner.full_screen,
        slug=slug,
        orden=siguiente_orden,
    )
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)
    return db_banner


# IMPORTANTE: Esta ruta estática debe ir ANTES de @router.patch("/{id}")
@router.patch("/reordenar")
def reordenar_banners(
    items: List[BannerOrdenItem],
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar el orden de visibilidad de múltiples banners"""
    if not items:
        return {"status": "ok", "updated": 0}

    mapeo_orden = {item.id: item.orden for item in items}

    banners = db.query(Banner).filter(Banner.id.in_(mapeo_orden.keys())).all()
    for banner in banners:
        banner.orden = mapeo_orden[banner.id]

    db.commit()
    return {"status": "ok", "updated": len(banners)}


@router.patch("/{id}", response_model=BannerOut)
def update_banner(
    id: int,
    banner: BannerUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un banner"""
    db_banner = db.query(Banner).filter(Banner.id == id).first()
    if not db_banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner no encontrado",
        )

    update_data = banner.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_banner.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Banner).filter(Banner.slug == slug, Banner.id != id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Banner, update_data["slug"], exclude_id=id
            )
        else:
            del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(db_banner, campo, valor)

    db.commit()
    db.refresh(db_banner)
    return db_banner


@router.delete("/{id}")
def delete_banner(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un banner"""
    db_banner = db.query(Banner).filter(Banner.id == id).first()
    if not db_banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner no encontrado",
        )
    db.delete(db_banner)
    db.commit()
    return {"message": "Banner eliminado correctamente"}


@router.get("/{slug}", response_model=BannerOut)
def get_banner_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un banner por slug"""
    banner = db.query(Banner).filter(Banner.slug == slug).first()
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner no encontrado",
        )
    return banner