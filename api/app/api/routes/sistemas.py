from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Sistemas, Subject, Usuario
from app.models.sistemas import TipoSistemaEnum
from app.schemas.sistemas import SistemasCreate, SistemasList, SistemasOut, SistemasResponse

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
):
    """Obtener todos los sistemas"""
    sistemas = db.execute(
        select(Sistemas)
        .options(selectinload(Sistemas.temas))
        .order_by(Sistemas.id.desc())
    ).scalars().all()

    return {
        "sistemas": sistemas,
        "total": len(sistemas),
    }


@router.get("/tipos")
def get_tipos():
    """Obtener los tipos de sistemas disponibles (Colocado ANTES de /{id})"""
    return {
        "tipos": {
            tipo.name: tipo.value for tipo in TipoSistemaEnum
        }
    }


@router.get("/tree", response_model=list[SistemasOut])
def obtener_sistemas_tree(
    db: Session = Depends(get_db)
):
    """Obtener árbol de sistemas principales (Colocado ANTES de /{id})"""
    sistemas = db.execute(
        select(Sistemas)
        .options(selectinload(Sistemas.temas))
        .where(Sistemas.parent_id.is_(None))
    ).scalars().all()
    return sistemas


@router.get("/slug/{slug}", response_model=SistemasResponse)
def get_sistemas_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un sistema por slug (Colocado ANTES de /{id})"""
    sistema = db.execute(
        select(Sistemas)
        .options(selectinload(Sistemas.temas))
        .where(Sistemas.slug == slug)
    ).scalar_one_or_none()

    if not sistema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    return sistema


@router.get("/{id}", response_model=SistemasOut)
def get_sistemas_id(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener un sistema por ID"""
    db_sistemas = db.execute(
        select(Sistemas)
        .options(selectinload(Sistemas.temas))
        .where(Sistemas.id == id)
    ).scalar_one_or_none()

    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    return db_sistemas


@router.post("/create", response_model=SistemasOut, status_code=status.HTTP_201_CREATED)
def create_sistemas(
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Crear un nuevo sistema"""
    slug = make_unique_slug(db, Sistemas, sistemas.titulo)

    db_sistemas = Sistemas(
        titulo=sistemas.titulo,
        descripcion=sistemas.descripcion,
        link=sistemas.link,
        tipo=sistemas.tipo,
        imagen=sistemas.imagen,
        destacado=sistemas.destacado,
        slider=sistemas.slider,
        imagen_slider=sistemas.imagen_slider,
        orden=sistemas.orden,
        claves=sistemas.claves,
        slug=slug,
    )
    db_sistemas.temas = _load_temas(db, sistemas.tema_ids or [])

    db.add(db_sistemas)
    db.commit()
    db.refresh(db_sistemas)
    return db_sistemas


@router.patch("/{id}", response_model=SistemasOut)
def update_sistemas(
    id: int,
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un sistema"""
    db_sistemas = db.get(Sistemas, id)
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )

    update_data = sistemas.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_sistemas.titulo:
        update_data["slug"] = make_unique_slug(
            db, Sistemas, update_data["titulo"], exclude_id=id
        )
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Sistemas, update_data["slug"], exclude_id=id
            )
        else:
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
    current_user: Usuario = Depends(verify_csrf),
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