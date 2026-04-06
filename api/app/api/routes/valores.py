from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.schemas.valores import ValoresCreate, ValoresOut, ValoresResponse
from app.models.valores import Valores, Usuario
from app.api.deps import get_current_user, get_db, verify_csrf

router = APIRouter(prefix="/valores", tags=["valores"])

@router.get("/", response_model=list[ValoresResponse])
def read_valores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    valores = db.query(Valores).all()
    return {
        "valores": valores,
        "total": len(valores),
    }

@router.post("/create", response_model=ValoresResponse)
def create_valores(
    valores: ValoresCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),    
    ):

    db_valores = Valores(**valores.dict())
    db.add(db_valores)
    db.commit()
    db.refresh(db_valores)
    return db_valores

@router.put("/{id}", response_model=ValoresResponse)
def update_valores(
    id: int,
    valores: ValoresCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),    
    ):
    db_valores = db.query(Valores).filter(Valores.id == id).first()
    if not db_valores:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valor no encontrado",
        )
    db_valores.nombre = valores.nombre
    db_valores.descripcion = valores.descripcion
    db_valores.imagen = valores.imagen
    db.commit()
    db.refresh(db_valores)
    return db_valores

@router.delete("/{id}", response_model=ValoresResponse)
def delete_valores(
    id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),    
    ):
    db_valores = db.query(Valores).filter(Valores.id == id).first()
    if not db_valores:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valor no encontrado",
        )
    db.delete(db_valores)
    db.commit()
    return {
        "message": "Valor eliminado correctamente",
    }
