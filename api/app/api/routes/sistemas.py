from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db
from app.models import Sistemas, Usuario, Subject
from app.schemas.sistemas import SistemasCreate, SistemasOut, SistemasResponse, SistemasList

router = APIRouter(prefix="/sistemas", tags=["sistemas"])


def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

    
@router.get("", response_model=SistemasList)
def read_sistemas(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los sistemas"""
    sistemas = db.execute(select(Sistemas).offset(skip).limit(limit)).scalars().all()
    total = db.execute(select(Sistemas).count()).scalar_one()
    return {
        "sistemas": sistemas,
        "total": total,
    }

@router.post("/create", response_model=SistemasOut, status_code=status.HTTP_201_CREATED)
def create_sistemas(
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    slug = slugify(sistemas.titulo)
    base_slug = slug
    contador = 1
    while db.execute(select(Sistemas).where(Sistemas.slug == slug)).scalar_one_or_none():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    """Crear un nuevo sistema"""
    db_sistemas = Sistemas(
        titulo=sistemas.titulo,
        descripcion=sistemas.descripcion,
        link=sistemas.link,
        tipo=sistemas.tipo,
        imagen=sistemas.imagen,
        destacado=sistemas.destacado,
        orden=sistemas.orden,
        claves=sistemas.claves,
        slug=slug,
    )
    db_sistemas.temas = _load_temas(db, sistemas.tema_ids or [])

    db.add(db_sistemas)
    db.commit()
    db.refresh(db_sistemas)
    return db_sistemas

@router.get("/{id}", response_model=SistemasOut)
def get_sistemas_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener un sistema por ID"""
    db_sistemas = db.get(Sistemas, id)
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    return db_sistemas

@router.put("/{id}", response_model=SistemasOut)
def update_sistemas(
    id: int,
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un sistema"""
    db_sistemas = db.get(Sistemas, id)
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )

    update_data = sistemas.dict(exclude_unset=True)
    
    if "titulo" in update_data and update_data["titulo"] != db_sistemas.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Sistemas).filter(Sistemas.slug == slug).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    if "tema_ids" in update_data:
        db_sistemas.temas = _load_temas(db, update_data.pop("tema_ids") or [])


    for campo, valor in update_data.items():
        setattr(db_sistemas, campo, valor)

    db.commit()
    db.refresh(db_sistemas)
    return db_sistemas

@router.delete("/{id}", response_model=SistemasOut)
def delete_sistemas(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un sistema"""
    db_sistemas = db.get(Sistemas, id)
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    db.delete(db_sistemas)
    db.commit()
    return db_sistemas

@router.get("/slug/{slug}", response_model=SistemasResponse)
def get_sistemas_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un sistema por slug"""
    sistema = db.execute(select(Sistemas).where(Sistemas.slug == slug)).scalar_one_or_none()
    if not sistema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    return sistema