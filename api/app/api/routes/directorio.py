from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Directorio, Usuario
from app.schemas.directorio import DirectorioCreate, DirectorioResponse

router = APIRouter(prefix="/directorio", tags=["directorio"])

@router.get("/", response_model=DirectorioResponse)
def list_directorio(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener lista de directorio"""
    directorio = db.query(Directorio).offset(skip).limit(limit).all()
    return directorio

@router.post("/create", response_model=DirectorioResponse)
def create_directorio(
    directorio: DirectorioCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Crear un nuevo directorio"""
    db_directorio = Directorio(**directorio.dict())
    db.add(db_directorio)
    db.commit()
    db.refresh(db_directorio)
    return db_directorio

@router.put("/{directorio_id}", response_model=DirectorioResponse)
def update_directorio(
    directorio_id: int,
    directorio: DirectorioCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Actualizar un directorio"""
    db_directorio = db.query(Directorio).filter(Directorio.id == directorio_id).first()
    if not db_directorio:
        raise HTTPException(status_code=404, detail="Directorio no encontrado")
    for campo, valor in directorio.dict().items():
        setattr(db_directorio, campo, valor)
    db.commit()
    db.refresh(db_directorio)
    return db_directorio

@router.delete("/{directorio_id}")
def delete_directorio(
    directorio_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Eliminar un directorio"""
    db_directorio = db.query(Directorio).filter(Directorio.id == directorio_id).first()
    if not db_directorio:
        raise HTTPException(status_code=404, detail="Directorio no encontrado")
    db.delete(db_directorio)
    db.commit()
    return {"message": "Directorio eliminado exitosamente"}

