from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.models import Mapa, Usuario
from app.models.mapa import TipoMapaEnum
from app.schemas.mapa import MapaCreate, MapaOut, MapaResponse, MapaTiposResponse

router = APIRouter(prefix="/mapas", tags=["mapa"])

@router.get("/", response_model=MapaResponse)
def read_mapa(
    db: Session = Depends(get_db),
):
    """Obtener todos los mapas"""
    mapas = db.query(Mapa).all()
    return {
        "mapas": mapas,
        "total": len(mapas),
    }

@router.post("/create", response_model=MapaOut)
def create_mapa(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
    mapa: MapaCreate = None,
):
    slug = slugify(mapa.titulo)
    base_slug = slug
    contador = 1
    while db.query(Mapa).filter(Mapa.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    """Crear un nuevo mapa"""
    db_mapa = Mapa(
        titulo=mapa.titulo,
        tipo=mapa.tipo,
        autor=mapa.autor,
        anyo=mapa.anyo,
        area=mapa.area,
        editor=mapa.editor,
        medida=mapa.medida,
        escala=mapa.escala,
        edicion=mapa.edicion,
        ubicacion=mapa.ubicacion,
        sitio_web=mapa.sitio_web,
        informacion=mapa.informacion,
        imagen=mapa.imagen,
        archivo=mapa.archivo,
        slug=slug,
    )
    db.add(db_mapa)
    db.commit()
    db.refresh(db_mapa)
    return db_mapa

@router.patch("/{id}", response_model=MapaOut)
def update_mapa(
    id: int,
    mapa: MapaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf)
):
    """Actualizar un mapa"""
    db_mapa = db.query(Mapa).filter(Mapa.id == id).first()
    if not db_mapa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapa no encontrado",
        )

    update_data = mapa.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_mapa.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Mapa).filter(Mapa.slug == slug, Mapa.id != id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(db_mapa, campo, valor)

    db.commit()
    db.refresh(db_mapa)
    return db_mapa

@router.delete("/{id}", response_model=MapaOut)
def delete_mapa(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un mapa"""
    db_mapa = db.query(Mapa).filter(Mapa.id == id).first()
    if not db_mapa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mapa no encontrado",
        )
    db.delete(db_mapa)
    db.commit()
    return db_mapa

@router.get("/tipos", response_model=MapaTiposResponse)
def get_tipos_mapa():
    return {
        "tipos": {
            tipos.name: tipos.value for tipos in TipoMapaEnum
        }
    }

@router.get("/slug/{slug}", response_model=MapaOut)
def get_mapa_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un mapa por slug"""
    mapa = db.query(Mapa).filter(Mapa.slug == slug).first()
    if not mapa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mapa no encontrado"
        )
    return mapa
