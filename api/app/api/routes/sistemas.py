from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_current_user, get_db
from app.models import Sistemas, Usuario
from app.schemas.sistemas import SistemasCreate, SistemasOut, SistemasResponse

router = APIRouter(prefix="/sistemas", tags=["sistemas"])

@router.get("", response_model=SistemasResponse)
def read_sistemas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los sistemas"""
    sistemas = db.query(Sistemas).all()
    return {
        "sistemas": sistemas,
        "total": len(sistemas),
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
    while db.query(Sistemas).filter(Sistemas.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    """Crear un nuevo sistema"""
    db_sistemas = Sistemas(
        titulo=sistemas.titulo,
        descripcion=sistemas.descripcion,
        link=sistemas.link,
        tipo=sistemas.tipo,
        imagen=sistemas.imagen,
        claves=sistemas.claves,
        slug=slug,
    )
    db.add(db_sistemas)
    db.commit()
    db.refresh(db_sistemas)
    return db.query(Sistemas).filter(Sistemas.id == db_sistemas.id).first()

@router.put("/{id}", response_model=SistemasOut)
def update_sistemas(
    id: int,
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un sistema"""
    db_sistemas = db.query(Sistemas).filter(Sistemas.id == id).first()
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

    for campo, valor in update_data.items():
        setattr(db_sistemas, campo, valor)

    db.commit()
    db.refresh(db_sistemas)
    return db.query(Sistemas).filter(Sistemas.id == db_sistemas.id).first()

@router.delete("/{id}", response_model=SistemasOut)
def delete_sistemas(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un sistema"""
    db_sistemas = db.query(Sistemas).filter(Sistemas.id == id).first()
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
    sistema = db.query(Sistemas).filter(Sistemas.slug == slug).first()
    if not sistema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    return sistema