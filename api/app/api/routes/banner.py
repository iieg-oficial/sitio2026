from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Banner, Usuario
from app.schemas.banner import BannerCreate, BannerOut, BannerResponse

router = APIRouter(prefix="/banner", tags=["banner"])

@router.get("/", response_model=BannerResponse)
def read_banner(
    db: Session = Depends(get_db),
):
    """Obtener todos los banners"""
    banner = db.query(Banner).all()
    return {
        "banners": banner,
        "total": len(banner),
    }

@router.post("/create", response_model=BannerOut, status_code=status.HTTP_201_CREATED)
def create_banner(
    banner: BannerCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(banner.titulo)
    base_slug = slug
    contador = 1
    while db.query(Banner).filter(Banner.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    """Crear un nuevo banner"""
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
    )
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)
    return db_banner

@router.patch("/{id}", response_model=BannerOut)
def update_banner(
    id: int,
    banner: BannerCreate,
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
    elif "slug" in update_data and not update_data["slug"]:
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