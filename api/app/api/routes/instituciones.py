from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models.instituciones import Instituciones
from app.schemas.instituciones import InstitucionesCreate, InstitucionesOut, InstitucionesResponse

router = APIRouter(prefix="/instituciones", tags=["instituciones"])

@router.get("", response_model=InstitucionesResponse)
async def listar_instituciones(
    db: Session = Depends(get_db)
    ):
    instituciones = db.query(Instituciones).all()
    return {"instituciones": instituciones, "total": len(instituciones)}

@router.get("/{institucion_id}", response_model=InstitucionesOut)
async def obtener_institucion(
    institucion_id: int, 
    db: Session = Depends(get_db)
    ):
    institucion = db.query(Instituciones).filter(Instituciones.id == institucion_id).first()
    if not institucion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institucion no encontrada"
        )
    return institucion

@router.post("/create", response_model=InstitucionesOut, status_code=status.HTTP_201_CREATED)
async def crear_institucion(
    institucion_in: InstitucionesCreate,
    db: Session = Depends(get_db),
):
    nuevo = Instituciones(
        nombre=institucion_in.nombre,
        descripcion=institucion_in.descripcion,
        logo=institucion_in.logo,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{institucion_id}", response_model=InstitucionesOut)
async def actualizar_institucion(
    institucion_id: int,
    institucion_in: InstitucionesCreate,
    db: Session = Depends(get_db),
):
    institucion = db.query(Instituciones).filter(Instituciones.id == institucion_id).first()
    if not institucion:
        raise HTTPException(status_code=404, detail="Institucion no encontrada")
    
    for campo, valor in institucion_in.model_dump().items():
        setattr(institucion, campo, valor)
    
    db.commit()
    db.refresh(institucion)
    return institucion

@router.delete("/{institucion_id}")
async def eliminar_institucion(
    institucion_id: int,
    db: Session = Depends(get_db),
):
    institucion = db.query(Instituciones).filter(Instituciones.id == institucion_id).first()
    if not institucion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institucion no encontrada"
        )
    db.delete(institucion)
    db.commit()
    return {"message": "Institucion eliminada exitosamente"}
