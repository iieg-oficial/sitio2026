from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Preguntas, Usuario, Subject
from app.schemas.preguntas import PreguntasCreate, PreguntasOut, PreguntasResponse, PreguntasList

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
    preguntas = db.execute(select(Preguntas)).scalars().all()
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

@router.get("/{pregunta_id}", response_model=PreguntasResponse)
def obtener_pregunta(
    pregunta_id: int,
    db: Session = Depends(get_db),
):
    pregunta = db.get(Preguntas, pregunta_id)
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
    elif "slug" in update_data and not update_data["slug"]:
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
    pregunta = db.get(Preguntas, pregunta_id)
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    db.delete(pregunta)
    db.commit()
    return {"message": "Pregunta eliminada exitosamente"}

@router.get("/slug/{slug}", response_model=PreguntasOut)
def get_pregunta_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una pregunta por slug"""
    pregunta = db.execute(select(Preguntas).where(Preguntas.slug == slug)).scalar_one_or_none()
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    return pregunta