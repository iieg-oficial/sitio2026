from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Documentacion, Usuario, Subject
from app.schemas import DocumentacionCreate, DocumentacionOut, DocumentacionResponse, DocumentacionList

router = APIRouter(prefix="/documentacion", tags=["documentacion"])

def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

@router.get("", response_model=DocumentacionList)
async def listar_documentaciones(
    db: Session = Depends(get_db),
):
    documentaciones = db.execute(
        select(Documentacion).order_by(Documentacion.titulo) 
    ).scalars().all()
    return {
        "documentaciones": documentaciones,
        "total": len(documentaciones),
    }

@router.post("/create", response_model=DocumentacionOut, status_code=status.HTTP_201_CREATED)
async def crear_documentacion(
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(documentacion_in.titulo)
    base_slug = slug
    contador = 1
    while db.execute(
        select(Documentacion).where(Documentacion.slug == slug)
    ).scalars().first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    nuevo = Documentacion(
        titulo=documentacion_in.titulo,
        descripcion=documentacion_in.descripcion,
        metodologia=documentacion_in.metodologia,
        codigo=documentacion_in.codigo,
        claves=documentacion_in.claves,
        slug=slug,
    )

    nuevo.temas = _load_temas(db, documentacion_in.tema_ids or [])

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/{documentacion_id}", response_model=DocumentacionResponse)
async def obtener_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
):
    documentacion = db.get(Documentacion, documentacion_id)
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion

@router.put("/{documentacion_id}", response_model=DocumentacionOut)
async def actualizar_documentacion(
    documentacion_id: int,
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    documentacion = db.get(Documentacion, documentacion_id)
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )

    update_data = documentacion_in.dict(exclude_unset=True)
    if "titulo" in update_data and update_data["titulo"] != documentacion.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.execute(
            select(Documentacion).where(Documentacion.slug == slug)
        ).scalars().first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    # Manejar la relación many-to-many de temas
    if "tema_ids" in update_data:
        documentacion.temas = _load_temas(db, update_data.pop("tema_ids") or [])

    for campo, valor in update_data.items():
        setattr(documentacion, campo, valor)

    db.commit()
    db.refresh(documentacion)
    return documentacion

@router.delete("/{documentacion_id}")
async def eliminar_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    documentacion = db.get(Documentacion, documentacion_id)
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    db.delete(documentacion)
    db.commit()
    return documentacion

@router.get("/slug/{slug}", response_model=DocumentacionOut)
def get_documentacion_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una documentación por slug"""
    documentacion = db.execute(
        select(Documentacion).where(Documentacion.slug == slug)
    ).scalars().first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion