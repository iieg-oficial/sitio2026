from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.organos import OrganosCreate, OrganosOut, OrganosResponse
from app.models import Organos, Usuario
from app.api.deps import get_current_user, get_db, verify_csrf

router = APIRouter(prefix="/organos", tags=["organos"])

@router.get("/", response_model=OrganosResponse)
def read_organos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    organos = db.query(Organos).all()
    return {
        "organos": organos,
        "total": len(organos),
    }

@router.post("/create", response_model=OrganosOut)
def create_organos(
    organos: OrganosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_organos = Organos(**organos.dict())
    db.add(db_organos)
    db.commit()
    db.refresh(db_organos)
    return db_organos

@router.put("/{id}", response_model=OrganosOut)
def update_organos(
    id: int,
    organos: OrganosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_organos = db.query(Organos).filter(Organos.id == id).first()
    if not db_organos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organo no encontrado",
        )
    db_organos.titulo = organos.titulo
    db_organos.descripcion = organos.descripcion
    db_organos.link = organos.link
    db.commit()
    db.refresh(db_organos)
    return db_organos

@router.delete("/{id}")
def delete_organos(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_organos = db.query(Organos).filter(Organos.id == id).first()
    if not db_organos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organo no encontrado",
        )
    db.delete(db_organos)
    db.commit()
    return {"message": "Organo eliminado correctamente"}
