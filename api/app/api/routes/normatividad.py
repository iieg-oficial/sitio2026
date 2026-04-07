from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.normatividad import NormatividadCreate, NormatividadOut, NormatividadResponse
from app.models import Normatividad, Usuario
from app.api.deps import get_current_user, get_db, verify_csrf

router = APIRouter(prefix="/normatividad", tags=["normatividad"])

@router.get("/", response_model=NormatividadResponse)
def read_normatividad(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    normatividad = db.query(Normatividad).all()
    return {
        "normatividad": normatividad,
        "total": len(normatividad),
    }

@router.post("/create", response_model=NormatividadOut)
def create_normatividad(
    normatividad: NormatividadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_normatividad = Normatividad(**normatividad.dict())
    db.add(db_normatividad)
    db.commit()
    db.refresh(db_normatividad)
    return db_normatividad

@router.put("/{id}", response_model=NormatividadOut)
def update_normatividad(
    id: int,
    normatividad: NormatividadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_normatividad = db.query(Normatividad).filter(Normatividad.id == id).first()
    if not db_normatividad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Normatividad no encontrada",
        )
    db_normatividad.nombre = normatividad.nombre
    db_normatividad.descripcion = normatividad.descripcion
    db_normatividad.link = normatividad.link
    db_normatividad.documento = normatividad.documento
    db.commit()
    db.refresh(db_normatividad)
    return db_normatividad

@router.delete("/{id}")
def delete_normatividad(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_normatividad = db.query(Normatividad).filter(Normatividad.id == id).first()
    if not db_normatividad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Normatividad no encontrada",
        )
    db.delete(db_normatividad)
    db.commit()
    return {"message": "Normatividad eliminada correctamente"}