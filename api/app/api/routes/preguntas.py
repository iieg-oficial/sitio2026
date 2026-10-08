from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Preguntas, Subject, Usuario
from app.schemas.preguntas import PreguntasCreate, PreguntasList, PreguntasOut, PreguntasResponse

router = APIRouter(prefix="/preguntas", tags=["preguntas"])


def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()


@router.get("", response_model=PreguntasList)
def listar_preguntas(
    db: Session = Depends(get_db),
):
    """Obtener todas las preguntas con sus temas pre-cargados"""
    preguntas = db.execute(
        select(Preguntas)
        .options(selectinload(Preguntas.temas))
        .order_by(Preguntas.id.desc())
    ).scalars().all()

    return {
        "preguntas": preguntas,
        "total": len(preguntas),
    }


@router.post("/create", response_model=PreguntasOut, status_code=status.HTTP_201_CREATED)
def crear_pregunta(
    pregunta_in: PreguntasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Crear una nueva pregunta"""
    slug = slugify(pregunta_in.pregunta)
    base_slug = slug
    contador = 1
    while db.query(Preguntas).filter(Preguntas.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    db_pregunta = Preguntas(
        pregunta=pregunta_in.pregunta,
        respuesta=pregunta_in.respuesta,
        claves=pregunta_in.claves,
        slug=slug,
    )
    db_pregunta.temas = _load_temas(db, pregunta_in.tema_ids or [])

    db.add(db_pregunta)
    db.commit()
    db.refresh(db_pregunta)
    return db_pregunta


@router.get("/slug/{slug}", response_model=PreguntasOut)
def get_pregunta_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una pregunta por slug (Definido antes de /{pregunta_id} para evitar colisión de tipos)"""
    pregunta = db.execute(
        select(Preguntas)
        .options(selectinload(Preguntas.temas))
        .where(Preguntas.slug == slug)
    ).scalar_one_or_none()
    
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    return pregunta


@router.get("/{pregunta_id}", response_model=PreguntasResponse)
def obtener_pregunta(
    pregunta_id: int,
    db: Session = Depends(get_db),
):
    """Obtener una pregunta por ID"""
    pregunta = db.execute(
        select(Preguntas)
        .options(selectinload(Preguntas.temas))
        .where(Preguntas.id == pregunta_id)
    ).scalar_one_or_none()

    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    return pregunta


@router.patch("/{pregunta_id}", response_model=PreguntasOut)
def actualizar_pregunta(
    pregunta_id: int,
    pregunta_in: PreguntasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar una pregunta existente"""
    pregunta = db.get(Preguntas, pregunta_id)
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )

    update_data = pregunta_in.model_dump(exclude_unset=True)

    if "pregunta" in update_data and update_data["pregunta"] != pregunta.pregunta:
        slug = slugify(update_data["pregunta"])
        base_slug = slug
        contador = 1
        while db.query(Preguntas).filter(Preguntas.slug == slug, Preguntas.id != pregunta_id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Preguntas, update_data["slug"], exclude_id=pregunta_id
            )
        else:
            del update_data["slug"]

    if "tema_ids" in update_data:
        pregunta.temas = _load_temas(db, update_data.pop("tema_ids") or [])

    for campo, valor in update_data.items():
        setattr(pregunta, campo, valor)

    db.commit()
    db.refresh(pregunta)
    return pregunta


@router.delete("/{pregunta_id}")
def eliminar_pregunta(
    pregunta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar una pregunta por ID"""
    pregunta = db.get(Preguntas, pregunta_id)
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    db.delete(pregunta)
    db.commit()
    return {"message": "Pregunta eliminada exitosamente"}