from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Sistemas, Usuario
from app.schemas.sistemas import SistemasCreate, SistemasOut, SistemasResponse

router = APIRouter(prefix="/sistemas", tags=["sistemas"])

@router.get("/", response_model=SistemasResponse)
def read_sistemas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los sistemas"""
    sistemas = db.query(Sistemas).all()
    return {
        "sistemas": sistemas,
        "total": len(sistemas),
    }

@router.post("/create", response_model=SistemasOut)
def create_sistemas(
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Crear un nuevo sistema"""
    db_sistemas = Sistemas(
        titulo=sistemas.titulo,
        descripcion=sistemas.descripcion,
        link=sistemas.link,
        tipo=sistemas.tipo,
        imagen=sistemas.imagen,
    )
    db.add(db_sistemas)
    db.commit()
    db.refresh(db_sistemas)
    return db_sistemas

@router.put("/{id}", response_model=SistemasOut)
def update_sistemas(
    id: int,
    sistemas: SistemasCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Actualizar un sistema"""
    db_sistemas = db.query(Sistemas).filter(Sistemas.id == id).first()
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    db_sistemas.titulo = sistemas.titulo
    db_sistemas.descripcion = sistemas.descripcion
    db_sistemas.link = sistemas.link
    db_sistemas.tipo = sistemas.tipo
    db_sistemas.imagen = sistemas.imagen
    db.commit()
    db.refresh(db_sistemas)
    return db_sistemas

@router.delete("/{id}", response_model=SistemasOut)
def delete_sistemas(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Eliminar un sistema"""
    db_sistemas = db.query(Sistemas).filter(Sistemas.id == id).first()
    if not db_sistemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sistema no encontrado",
        )
    db.delete(db_sistemas)
    db.commit()
    return db_sistemas