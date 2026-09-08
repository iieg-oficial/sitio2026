from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.models import Cuadernillo, Usuario
from app.models.cuadernillos import MunicipioEnum
from app.schemas import CuadernilloCreate, CuadernilloOut, CuadernilloResponse

router = APIRouter(prefix="/cuadernillos", tags=["cuadernillos"])

@router.get("/", response_model=CuadernilloResponse)
def read_cuadernillos(
    db: Session = Depends(get_db),
):
    """Obtener todos los cuadernillos"""
    cuadernillos = db.query(Cuadernillo).all()
    return {
        "cuadernillos": cuadernillos,
        "total": len(cuadernillos),
    }


@router.post("/", response_model=CuadernilloOut, status_code=status.HTTP_201_CREATED)
def create_cuadernillo(
    cuadernillo: CuadernilloCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(cuadernillo.titulo)
    base_slug = slug
    contador = 1
    while db.query(Cuadernillo).filter(Cuadernillo.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    """Crear un nuevo cuadernillo"""
    db_cuadernillo = Cuadernillo(
        titulo=cuadernillo.titulo,
        archivo=cuadernillo.archivo,
        municipio=cuadernillo.municipio,
        anyo=cuadernillo.anyo,
        slug=slug,
    )
    db.add(db_cuadernillo)
    db.commit()
    db.refresh(db_cuadernillo)
    return db_cuadernillo

@router.patch("/{id}", response_model=CuadernilloOut)
def update_cuadernillo(
    id: int,
    cuadernillo: CuadernilloCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un cuadernillo existente"""
    db_cuadernillo = db.query(Cuadernillo).filter(Cuadernillo.id == id).first()
    if not db_cuadernillo:
        raise HTTPException(status_code=404, detail="Cuadernillo no encontrado")

    update_data = cuadernillo.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_cuadernillo.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Cuadernillo).filter(Cuadernillo.slug == slug, Cuadernillo.id != id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and update_data["slug"]:
        del update_data["slug"]

    for field, value in update_data.items():
        setattr(db_cuadernillo, field, value)

    db.commit()
    db.refresh(db_cuadernillo)
    return db_cuadernillo


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cuadernillo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un cuadernillo existente"""
    db_cuadernillo = db.query(Cuadernillo).filter(Cuadernillo.id == id).first()
    if not db_cuadernillo:
        raise HTTPException(status_code=404, detail="Cuadernillo no encontrado")

    db.delete(db_cuadernillo)
    db.commit()
    return {"message": "Cuadernillo eliminado correctamente"}

@router.get("/municipios")
def get_municipios(
):
    return {
        "municipios": {
            municipio.name: municipio.value for municipio in MunicipioEnum
        }
    }


@router.get("/{slug}", response_model=CuadernilloOut)
def get_cuadernillo_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un cuadernillo por slug"""
    cuadernillo = db.query(Cuadernillo).filter(Cuadernillo.slug == slug).first()
    if not cuadernillo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuadernillo no encontrado",
        )
    return cuadernillo
