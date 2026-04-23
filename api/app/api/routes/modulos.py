from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Modulo, Usuario
from app.schemas.modulo import ModuloCreate, ModuloOut, ModuloResponse

router = APIRouter(prefix="/modulo", tags=["modulo"])

@router.get("", response_model=ModuloResponse)
def read_modulo(   
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los modulos"""
    modulo = db.query(Modulo).all()
    return {
        "modulos": modulos,
        "total": len(modulos),
    }

@router.get("/{id}", response_model=ModuloOut)
def read_modulo_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener un modulo por id"""
    db_modulo = db.query(Modulo).filter(Modulo.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    return db_modulo

@router.post("/create", response_model=ModuloOut)
def create_modulo(
    modulo: ModuloCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crear un nuevo modulo"""
    db_modulo = Modulo(
        nombre=modulo.nombre,
        descripcion=modulo.descripcion,
    )
    db.add(db_modulo)
    db.commit()
    db.refresh(db_modulo)
    return db_modulo

@router.put("/{id}", response_model=ModuloOut)
def update_modulo(
    id: int,
    modulo: ModuloCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un modulo"""
    db_modulo = db.query(Modulo).filter(Modulo.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    db_modulo.nombre = modulo.nombre
    db_modulo.descripcion = modulo.descripcion
    db.commit()
    db.refresh(db_modulo)
    return db_modulo

@router.delete("/{id}", response_model=ModuloOut)
def delete_modulo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un modulo"""
    db_modulo = db.query(Modulo).filter(Modulo.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    db.delete(db_modulo)
    db.commit()
    return db_modulo