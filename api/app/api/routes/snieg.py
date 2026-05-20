from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.schemas.snieg import SniegResponse, SniegCreate, SniegOut
from app.models import Snieg, Usuario
from app.api.deps import get_db, get_current_user, verify_csrf

router = APIRouter(prefix="/snieg", tags=["snieg"])

@router.get("/", response_model=SniegResponse)
def read_snieg(
    db: Session = Depends(get_db),
    ):
    snieg = db.query(Snieg).all()
    return {
        "snieg": snieg,
        "total": len(snieg),
    }

@router.post("/create", response_model=SniegOut)
def create_snieg(
    snieg: SniegCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
    ):
    slug = slugify(snieg.titulo)
    base_slug = slug
    contador = 1
    while db.query(Snieg).filter(Snieg.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    db_snieg = Snieg(
        titulo=snieg.titulo,
        descripcion=snieg.descripcion,
        imagen=snieg.imagen,
        enlace=snieg.enlace,
        slug=slug,
    )
    db.add(db_snieg)
    db.commit()
    db.refresh(db_snieg)
    return db_snieg

@router.put("/{id}", response_model=SniegOut)
def update_snieg(
    id: int,
    snieg: SniegCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
    ):

    db_snieg = db.query(Snieg).filter(Snieg.id == id).first()
    if not db_snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Snieg no encontrado",
        )

    update_data = snieg.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_snieg.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Snieg).filter(Snieg.slug == slug, Snieg.id != id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]
    
    for campo, valor in update_data.items():
        setattr(db_snieg, campo, valor)
    
    db.commit()
    db.refresh(db_snieg)
    return db_snieg

@router.delete("/{id}")
def delete_snieg(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
    ):
    db_snieg = db.query(Snieg).filter(Snieg.id == id).first()
    if not db_snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Snieg no encontrado",
        )
    db.delete(db_snieg)
    db.commit()
    return {"message": "Snieg eliminado correctamente"}

@router.get("/slug/{slug}", response_model=SniegResponse)
def get_snieg_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un snieg por slug"""
    snieg = db.query(Snieg).filter(Snieg.slug == slug).first()
    if not snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snieg no encontrado"
        )
    return snieg