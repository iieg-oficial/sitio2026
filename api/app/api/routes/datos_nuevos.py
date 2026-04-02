from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import DatosNuevos, Usuario     
from app.schemas.datos_nuevos import DatosNuevosOut, DatosNuevosResponse, DatosNuevosCreate

router = APIRouter(prefix="/datos-nuevos", tags=["datos-nuevos"])

@router.get("/", response_model=DatosNuevosResponse)
def read_datos_nuevos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los datos nuevos"""
    datos_nuevos = db.query(DatosNuevos).all()
    return {
        "datos_nuevos": datos_nuevos,
        "total": len(datos_nuevos),
    }

@router.post("/create", response_model=DatosNuevosCreate)
def create_datos_nuevos(
    datos_nuevos: DatosNuevosCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Crear un nuevo dato"""
    db_datos_nuevos = DatosNuevos(
        numero=datos_nuevos.numero,
        descripcion=datos_nuevos.descripcion,
    )
    db.add(db_datos_nuevos)
    db.commit()
    db.refresh(db_datos_nuevos)
    return db_datos_nuevos

@router.put("/{id}", response_model=DatosNuevosOut)
def update_datos_nuevos(
    id: int,
    datos_nuevos: DatosNuevosCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Actualizar un dato"""
    db_datos_nuevos = db.query(DatosNuevos).filter(DatosNuevos.id == id).first()
    if not db_datos_nuevos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dato no encontrado",
        )
    db_datos_nuevos.numero = datos_nuevos.numero
    db_datos_nuevos.descripcion = datos_nuevos.descripcion
    db.commit()
    db.refresh(db_datos_nuevos)
    return db_datos_nuevos

@router.delete("/{id}", response_model=DatosNuevosOut)
def delete_datos_nuevos(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    """Eliminar un dato"""
    db_datos_nuevos = db.query(DatosNuevos).filter(DatosNuevos.id == id).first()
    if not db_datos_nuevos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dato no encontrado",
        )
    db.delete(db_datos_nuevos)
    db.commit()
    return db_datos_nuevos