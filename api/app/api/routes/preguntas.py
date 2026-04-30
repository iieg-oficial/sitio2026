from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Preguntas, Usuario
from app.schemas import PreguntasCreate, PreguntasOut, PreguntasResponse, PreguntasListResponse

router = APIRouter(prefix="/preguntas", tags=["preguntas"])

@router.get("", response_model=PreguntasListResponse)
def listar_preguntas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    preguntas = db.query(Preguntas).options(joinedload(Preguntas.subject)).all()
    return {
        "preguntas": preguntas,
        "total": len(preguntas),
    }

@router.post("/create", response_model=PreguntasOut, status_code=status.HTTP_201_CREATED)
def crear_pregunta(
    pregunta_in: PreguntasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
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
        subject_id=pregunta_in.subject_id,
        slug=slug,
    )
    db.add(db_pregunta)
    db.commit()
    db.refresh(db_pregunta)
    return db.query(Preguntas).options(joinedload(Preguntas.subject)).filter(Preguntas.id == db_pregunta.id).first()

@router.get("/{pregunta_id}", response_model=PreguntasResponse)
def obtener_pregunta(
    pregunta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pregunta = db.query(Preguntas).options(joinedload(Preguntas.subject)).filter(Preguntas.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    return pregunta

@router.put("/{pregunta_id}", response_model=PreguntasOut)
def actualizar_pregunta(
    pregunta_id: int,
    pregunta_in: PreguntasCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pregunta = db.query(Preguntas).options(joinedload(Preguntas.subject)).filter(Preguntas.id == pregunta_id).first()
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
    
    for campo, valor in update_data.items():
        setattr(pregunta, campo, valor)
    
    db.commit()
    db.refresh(pregunta)
    return db.query(Preguntas).options(joinedload(Preguntas.subject)).filter(Preguntas.id == pregunta_id).first()

@router.delete("/{pregunta_id}")
def eliminar_pregunta(
    pregunta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pregunta = db.query(Preguntas).filter(Preguntas.id == pregunta_id).first()
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
    pregunta = db.query(Preguntas).filter(Preguntas.slug == slug).first()
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada"
        )
    return pregunta