from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.snieg import SniegResponse, SniegCreate, SniegOut
from app.models import Snieg, Usuario
from app.api.deps import get_db, get_current_user, verify_csrf

router = APIRouter(prefix="/snieg", tags=["snieg"])

@router.get("/", response_model=SniegResponse)
def read_snieg(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    snieg = db.query(Snieg).all()
    return {
        "snieg": snieg,
        "total": len(snieg),
    }

@router.post("/create", response_model=SniegOut)
def create_snieg(
    snieg: SniegCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_snieg = Snieg(**snieg.dict())
    db.add(db_snieg)
    db.commit()
    db.refresh(db_snieg)
    return db_snieg

@router.put("/{id}", response_model=SniegOut)
def update_snieg(
    id: int,
    snieg: SniegCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_snieg = db.query(Snieg).filter(Snieg.id == id).first()
    if not db_snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Snieg no encontrado",
        )
    db_snieg.titulo = snieg.titulo
    db_snieg.descripcion = snieg.descripcion
    db_snieg.imagen = snieg.imagen
    db_snieg.enlace = snieg.enlace
    db.commit()
    db.refresh(db_snieg)
    return db_snieg

@router.delete("/{id}")
def delete_snieg(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_snieg = db.query(Snieg).filter(Snieg.id == id).first()
    if not db_snieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Snieg no encontrado",
        )
    db.delete(db_snieg)
    db.commit()
    return {"message": "Snieg eliminado correctamente"}