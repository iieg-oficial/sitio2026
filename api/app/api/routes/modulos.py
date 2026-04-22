from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Modulos, Usuario
from app.schemas.modulos import ModulosCreate, ModulosOut, ModulosResponse

router = APIRouter(prefix="/modulos", tags=["modulos"])

@router.get("", response_model=ModulosResponse)
def read_modulos(
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
def read_modulos_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener un modulo por id"""
    db_modulos = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulos:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    return db_modulos

@router.post("/create", response_model=ModulosOut)
def create_modulos(
    modulos: ModulosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crear un nuevo modulo"""
    db_modulos = Modulos(
        nombre=modulos.nombre,
        descripcion=modulos.descripcion,
    )
    db.add(db_modulos)
    db.commit()
    db.refresh(db_modulos)
    return db_modulos

@router.put("/{id}", response_model=ModulosOut)
def update_modulos(
    id: int,
    modulos: ModulosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un modulo"""
    db_modulos = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulos:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    db_modulos.nombre = modulos.nombre
    db_modulos.descripcion = modulos.descripcion
    db.commit()
    db.refresh(db_modulos)
    return db_modulos

@router.delete("/{id}", response_model=ModulosOut)
def delete_modulos(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un modulo"""
    db_modulos = db.query(Modulos).filter(Modulos.id == id).first()
    if not db_modulos:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    db.delete(db_modulos)
    db.commit()
    return db_modulos