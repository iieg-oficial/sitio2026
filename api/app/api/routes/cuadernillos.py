from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from slugify import slugify
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.search import escape_like
from app.models import Cuadernillo, Usuario
from app.models.cuadernillos import MunicipioEnum
from app.schemas import CuadernilloCreate, CuadernilloOut, CuadernilloResponse

router = APIRouter(prefix="/cuadernillos", tags=["cuadernillos"])

def parse_year(val) -> int:
    """Convierte el valor de año a entero de forma segura."""
    if not val:
        return 0
    try:
        return int(str(val).strip())
    except (ValueError, TypeError):
        return 0

@router.get("/", response_model=CuadernilloResponse)
def read_cuadernillos(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
    db: Session = Depends(get_db),
):
    query = select(Cuadernillo)

    if search:
        like = f"%{escape_like(search)}%"
        query = query.where(
            or_(
                Cuadernillo.titulo.ilike(like, escape='\\'),
            )
        )

    # 1. Total de registros para la paginación
    total = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    # 2. Traer todos los registros filtrados ordenados por ID desc por defecto
    all_cuadernillos = db.execute(
        query.order_by(Cuadernillo.id.desc())
    ).scalars().all()

    # 3. Ordenar de manera segura en Python: 1º Año (desc) -> 2º ID (desc)
    all_cuadernillos.sort(
        key=lambda x: (parse_year(x.anyo), x.id or 0),
        reverse=True
    )

    # 4. Aplicar paginación manual sobre el arreglo ordenado
    start = (page - 1) * page_size
    end = start + page_size
    paginated_cuadernillos = all_cuadernillos[start:end]

    return {"cuadernillos": paginated_cuadernillos, "total": total}


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
