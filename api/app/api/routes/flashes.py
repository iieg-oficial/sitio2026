from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from slugify import slugify
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.core.search import escape_like
from app.models import Flashes, Subject, Usuario
from app.models.flashes import MesEnum, PeriocidadEnum
from app.schemas.flashes import FlashesCreate, FlashesList, FlashesOut, FlashesResponse

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
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
    db: Session = Depends(get_db),
):
    query = select(Flashes)

    if search:
        like = f"%{escape_like(search)}%"
        query = query.where(
            or_(
                Flashes.titulo.ilike(like, escape='\\'),
                Flashes.desc_jal.ilike(like, escape='\\'),
                Flashes.desc_nac.ilike(like, escape='\\'),
            )
        )

    total = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    flashes = db.execute(
        query.order_by(Flashes.anyo.desc(), Flashes.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).scalars().all()

    return {"flashes": flashes, "total": total}

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
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Flashes, update_data["slug"], exclude_id=id
            )
        else:
            del update_data["slug"]

    if "tema_ids" in update_data:
        db_flashes.temas = _load_temas(db, update_data.pop("tema_ids") or [])

    for campo, valor in update_data.items():
        setattr(db_flashes, campo, valor)

    if "slug" in update_data:
        db_flashes.slug = update_data["slug"]

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


