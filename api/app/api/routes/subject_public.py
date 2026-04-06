from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.subject import Subject
from app.schemas.subject import SubjectOut, SubjectResponse

router = APIRouter(prefix="/subject", tags=["portal - subject"])


@router.get("", response_model=list[SubjectResponse])
async def listar_subjects(
    db: Session = Depends(get_db)):
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