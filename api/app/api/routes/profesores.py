from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import Profesores, Usuario
from app.schemas.profesores import ProfesoresCreate, ProfesoresOut, ProfesoresResponse

router = APIRouter(prefix="/profesores", tags=["profesores"])

@router.get("", response_model=ProfesoresResponse)
async def listar_profesores(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    profesores = db.query(Profesores).all()
    return {
        "profesores": profesores,
        "total": len(profesores),
    }

@router.get("/{profesor_id}", response_model=ProfesoresOut)
async def obtener_profesor(
    profesor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    profesor = db.query(Profesores).filter(Profesores.id == profesor_id).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    return profesor

@router.post("/create", response_model=ProfesoresOut, status_code=status.HTTP_201_CREATED)
async def crear_profesor(
    profesor_in: ProfesoresCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    nuevo = Profesores(
        nombre=profesor_in.nombre,
        descripcion=profesor_in.descripcion,
        puesto=profesor_in.puesto,
        foto=profesor_in.foto,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{profesor_id}", response_model=ProfesoresOut)
async def actualizar_profesor(
    profesor_id: int,
    profesor_in: ProfesoresCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    profesor = db.query(Profesores).filter(Profesores.id == profesor_id).first()
    if not profesor:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    
    for campo, valor in profesor_in.model_dump().items():
        setattr(profesor, campo, valor)
    
    db.commit()
    db.refresh(profesor)
    return profesor

@router.delete("/{profesor_id}")
async def eliminar_profesor(
    profesor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    profesor = db.query(Profesores).filter(Profesores.id == profesor_id).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    db.delete(profesor)
    db.commit()
    return {"message": "Profesor eliminado exitosamente"}