from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Modulos, Usuario
from app.schemas.modulos import ModulosCreate, ModulosOut, ModulosResponse

router = APIRouter(prefix="/modulo", tags=["modulo"])

@router.get("", response_model=ModulosResponse)
def read_modulo(   
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los modulos"""
    modulos = db.query(Modulos).all()
    return {
        "modulos": modulos,
        "total": len(modulos),
    }

@router.get("/{id}", response_model=ModulosOut)
def read_modulo_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener un modulo por id"""
    db_modulo = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    return db_modulo

@router.post("/create", response_model=ModulosOut)
def create_modulo(
    modulo: ModulosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crear un nuevo modulo"""
    db_modulo = Modulos(
        nombre=modulo.nombre,
        descripcion=modulo.descripcion,
    )
    db.add(db_modulo)
    db.commit()
    db.refresh(db_modulo)
    return db_modulo

@router.put("/{id}", response_model=ModulosOut)
def update_modulo(
    id: int,
    modulo: ModulosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un modulo"""
    db_modulo = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    db_modulo.nombre = modulo.nombre
    db_modulo.descripcion = modulo.descripcion
    db.commit()
    db.refresh(db_modulo)
    return db_modulo

@router.delete("/{id}", response_model=ModulosOut)
def delete_modulo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un modulo"""
    db_modulo = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    db.delete(db_modulo)
    db.commit()
    return db_modulo