from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Flashes, Usuario, Subject  
from app.models.flashes import PeriocidadEnum, MesEnum 
from app.schemas.flashes import FlashesOut, FlashesResponse, FlashesCreate, FlashesList

router = APIRouter(prefix="/flashes", tags=["flashes"])  

def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

@router.get("", response_model=FlashesList)
def read_flashes(
    db: Session = Depends(get_db),
):
    """Obtener todos los flashes"""
    flashes = db.execute(select(Flashes)).scalars().all()
    return {
        "flashes": flashes,
        "total": len(flashes),
    }

@router.post("/create", response_model=FlashesOut, status_code=status.HTTP_201_CREATED)
def create_flashes(
    flashes: FlashesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
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
        mes=flashes.mes,
        anyo=flashes.anyo,
        fuente=flashes.fuente,
        link=flashes.link,
        claves=flashes.claves,
        slug=slug,
    )
    db_flashes.temas = _load_temas(db, flashes.tema_ids or [])
    
    db.add(db_flashes)
    db.commit()
    db.refresh(db_flashes)
    return db_flashes

@router.get("/periocidad")
def get_periocidad():
    return{
        "periodo": {
            periodo.name: periodo.value for periodo in PeriocidadEnum
        }
    }

@router.get("/meses")
def listar_meses():
    return {
        "meses": {
            mes.name: mes.value for mes in MesEnum
        }
    }

@router.get("/{id}", response_model=FlashesResponse)
def get_flashes_by_id(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener un flash por ID"""
    db_flashes = db.get(Flashes, id)
    if not db_flashes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    return db_flashes

@router.patch("/{id}", response_model=FlashesOut)
def update_flashes(
    id: int,
    flashes: FlashesCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un flash"""
    db_flashes = db.get(Flashes, id)
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
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    if "tema_ids" in update_data:
        db_flashes.temas = _load_temas(db, update_data.pop("tema_ids") or [])
    
    for campo, valor in update_data.items():
        setattr(db_flashes, campo, valor)

    db.commit()
    db.refresh(db_flashes)
    return db_flashes

@router.delete("/{flashes_id}")
def delete_flashes( 
    flashes_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un flash"""
    db_flashes = db.get(Flashes, flashes_id)
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
    flash = db.execute(select(Flashes).where(Flashes.slug == slug)).scalar_one_or_none()
    if not flash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash no encontrado",
        )
    return flash