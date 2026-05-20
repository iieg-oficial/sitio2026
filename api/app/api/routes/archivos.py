from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Archivos, Usuario, Subject
from app.schemas.archivo import ArchivoCreate, ArchivoOut, ArchivoResponse, ArchivoList

router = APIRouter(prefix="/archivos", tags=["archivos"])


def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()


@router.get("", response_model=ArchivoList)
async def listar_archivos(
    db: Session = Depends(get_db),
):
    archivos = db.execute(select(Archivos)).scalars().all()
    return {
        "archivos": archivos,
        "total": len(archivos),
    }


@router.post("/create", response_model=ArchivoOut, status_code=status.HTTP_201_CREATED)
async def crear_archivo(
    archivo_in: ArchivoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(archivo_in.titulo)
    base_slug = slug
    contador = 1
    while db.execute(select(Archivos).where(Archivos.slug == slug)).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    nuevo = Archivos(
        titulo=archivo_in.titulo,
        fecha=archivo_in.fecha,
        tipo=archivo_in.tipo,
        periocidad=archivo_in.periocidad,
        archivo=archivo_in.archivo,
        slug=slug,
    )
    nuevo.temas = _load_temas(db, archivo_in.tema_ids or [])

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/{archivo_id}", response_model=ArchivoResponse)
async def obtener_archivo(
    archivo_id: int,
    db: Session = Depends(get_db),
):
    archivo = db.get(Archivos, archivo_id)
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    return archivo


@router.put("/{archivo_id}", response_model=ArchivoOut)
async def actualizar_archivo(
    archivo_id: int,
    archivo_in: ArchivoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    archivo = db.get(Archivos, archivo_id)
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )

    update_data = archivo_in.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != archivo.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.execute(
            select(Archivos).where(Archivos.slug == slug, Archivos.id != archivo_id)
        ).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    # Manejar la relación many-to-many de temas
    if "tema_ids" in update_data:
        archivo.temas = _load_temas(db, update_data.pop("tema_ids") or [])

    for campo, valor in update_data.items():
        setattr(archivo, campo, valor)

    db.commit()
    db.refresh(archivo)
    return archivo


@router.delete("/{archivo_id}")
async def eliminar_archivo(
    archivo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    archivo = db.get(Archivos, archivo_id)
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    db.delete(archivo)
    db.commit()
    return {"message": "Archivo eliminado exitosamente"}

@router.get("/slug/{slug}", response_model=ArchivoOut)
async def obtener_archivo_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    archivo = db.execute(select(Archivos).where(Archivos.slug == slug)).scalar_one_or_none()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    return archivo