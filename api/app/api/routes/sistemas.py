from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Sistemas, Usuario, Subject
from app.models.sistemas import TipoSistemaEnum
from app.schemas.sistemas import SistemasCreate, SistemasOut, SistemasResponse, SistemasList

router = APIRouter(prefix="/sistemas", tags=["sistemas"])


def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

@router.get("/tree", response_model=list[SistemasOut])
async def obtener_sistemas_tree(    
    db: Session = Depends(get_db)):
    sistemas = db.execute(select(Sistemas).where(Sistemas.parent_id == None)).scalars().all()
    return sistemas

    
@router.get("/", response_model=SistemasList)
def read_sistemas(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Obtener todos los sistemas"""
    sistemas = db.execute(select(Sistemas).offset(skip).limit(limit)).scalars().all()
    
    return {
        "sistemas": sistemas,
        "total": len(sistemas),
    }

@router.post("/create", response_model=SistemasOut, status_code=status.HTTP_201_CREATED)
def create_sistemas(
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = make_unique_slug(db, Sistemas, sistemas.titulo)

    """Crear un nuevo sistema"""
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

@router.get("/tipos")
def get_tipos():
    return{
        "tipos": {
            tipo.name: tipo.value for tipo in TipoSistemaEnum
        }
    }

@router.get("/{id}", response_model=SistemasOut)
def get_sistemas_id(
    id: int,
    db: Session = Depends(get_db),
):
    """Obtener un sistema por ID"""
    db_sistemas = db.get(Sistemas, id)
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
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

    update_data = sistemas.dict(exclude_unset=True)
    
    if "titulo" in update_data and update_data["titulo"] != db_sistemas.titulo:
        update_data["slug"] = make_unique_slug(
            db, Sistemas, update_data["titulo"], exclude_id=id
        )
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