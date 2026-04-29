from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectOut, SubjectResponse

router = APIRouter(prefix="/subject", tags=["subject"])


@router.get("", response_model=list[SubjectResponse])
async def listar_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Subject).all()
    return subjects 


@router.get("/{subject_id}", response_model=SubjectOut)
async def obtener_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject no encontrado"
        )
    return subject


@router.post("/create", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def crear_subject(
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    nuevo = Subject(
        titulo=subject_in.titulo,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{subject_id}", response_model=SubjectOut)
async def actualizar_subject(
    subject_id: int,
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject no encontrado")
    
    for campo, valor in subject_in.model_dump().items():
        setattr(subject, campo, valor)
    
    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/{subject_id}")
async def eliminar_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject no encontrado"
        )
    db.delete(subject)
    db.commit()
    return {"message": "Subject eliminado exitosamente"}

@router.get("/slug/{slug}", response_model=SubjectOut)
def get_subject_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un subject por slug"""
    subject = db.query(Subject).filter(Subject.slug == slug).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject no encontrado"
        )
    return subject