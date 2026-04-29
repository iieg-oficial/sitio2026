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
    db_pregunta = Preguntas(**pregunta_in.dict())
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
    for campo, valor in pregunta_in.dict().items():
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