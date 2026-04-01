from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Plataformas, Usuario     
from app.schemas.plataformas import PlataformasResponse, PlataformasCreate

router = APIRouter(prefix="/plataformas", tags=["plataformas"])

@router.get("/", response_model=list[PlataformasResponse])
def list_plataformas(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener lista de plataformas"""
    plataformas = db.query(Plataformas).offset(skip).limit(limit).all()
    return plataformas

@router.post("/create", response_model=PlataformasResponse)
def create_plataforma(
    plataforma: PlataformasCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Crear una nueva plataforma"""
    db_plataforma = Plataformas(**plataforma.dict())
    db.add(db_plataforma)
    db.commit()
    db.refresh(db_plataforma)
    return db_plataforma

@router.put("/{plataforma_id}", response_model=PlataformasResponse)
def update_plataforma(
    plataforma_id: int,
    plataforma: PlataformasCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Actualizar una plataforma"""
    db_plataforma = db.query(Plataformas).filter(Plataformas.id == plataforma_id).first()
    if not db_plataforma:
        raise HTTPException(status_code=404, detail="Plataforma no encontrada")
    for campo, valor in plataforma.dict().items():
        setattr(db_plataforma, campo, valor)
    db.commit()
    db.refresh(db_plataforma)
    return db_plataforma

@router.delete("/{plataforma_id}")
def delete_plataforma(
    plataforma_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Eliminar una plataforma"""
    db_plataforma = db.query(Plataformas).filter(Plataformas.id == plataforma_id).first()
    if not db_plataforma:
        raise HTTPException(status_code=404, detail="Plataforma no encontrada")
    db.delete(db_plataforma)
    db.commit()
    return {"message": "Plataforma eliminada exitosamente"}
