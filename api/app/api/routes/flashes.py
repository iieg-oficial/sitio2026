from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Flashes, Usuario     
from app.schemas.flashes import FlashesOut, FlashesResponse, FlashesCreate

router = APIRouter(prefix="/flashes", tags=["flashes"])  

@router.get("/", response_model=FlashesResponse)
def read_flashes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los flashes"""
    flashes = db.query(Flashes).all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }

@router.post("/create", response_model=FlashesOut)
def create_flashes(
    flashes: FlashesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    slug = slugify(flashes.titulo)
    base_slug = slug
    contador = 1
    while db.query(Flashes).filter(Flashes.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    """Crear un nuevo flash"""
    db_flashes = Flashes(
        titulo=flashes.titulo,
        desc_jal=flashes.desc_jal,
        desc_nac=flashes.desc_nac,
        periocidad=flashes.periocidad,
        fecha_publicacion=flashes.fecha_publicacion,
        fuente=flashes.fuente,
        link=flashes.link,
        subject_id=flashes.subject_id,
        slug=slug,
    )
    db.add(db_flashes)
    db.commit()
    db.refresh(db_flashes)
    return db.query(Flashes).options(joinedload(Flashes.subject)).filter(Flashes.id == db_flashes.id).first()

@router.put("/{id}", response_model=FlashesOut)
def update_flashes(
    id: int,
    flashes: FlashesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un flash"""
    db_flashes = db.query(Flashes).options(joinedload(Flashes.subject)).filter(Flashes.id == id).first()
    if not db_flashes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    
    update_data = flashes.dict(exclude_unset=True)
    if "titulo" in update_data and update_data["titulo"] != db_flashes.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Flashes).filter(Flashes.slug == slug).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    
    for campo, valor in update_data.items():
        setattr(db_flashes, campo, valor)

    db.commit()
    db.refresh(db_flashes)
    return db.query(Flashes).options(joinedload(Flashes.subject)).filter(Flashes.id == db_flashes.id).first()

@router.delete("/{flashes_id}")
def delete_flashes( 
    flashes_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un flash"""
    db_flashes = db.query(Flashes).filter(Flashes.id == flashes_id).first()
    if not db_flashes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    db.delete(db_flashes)
    db.commit()
    return db_flashes

@router.get("/slug/{slug}", response_model=FlashesOut)
def get_flashes_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un flash por slug"""
    flash = db.query(Flashes).filter(Flashes.slug == slug).first()
    if not flash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    return flash