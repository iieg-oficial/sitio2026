from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Documentacion, Usuario
from app.schemas import DocumentacionCreate, DocumentacionOut, DocumentacionResponse, DocumentacionList

router = APIRouter(prefix="/documentacion", tags=["documentacion"])

@router.get("", response_model=DocumentacionList)
async def listar_documentaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentaciones = db.query(Documentacion).options(joinedload(Documentacion.subject)).all()
    return {
        "documentaciones": documentaciones,
        "total": len(documentaciones),
    }

@router.post("/create", response_model=DocumentacionOut, status_code=status.HTTP_201_CREATED)
async def crear_documentacion(
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    nuevo = Documentacion(
        titulo=documentacion_in.titulo,
        descripcion=documentacion_in.descripcion,
        metodologia=documentacion_in.metodologia,
        codigo=documentacion_in.codigo,
        claves=documentacion_in.claves,
        subject_id=documentacion_in.subject_id,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return db.query(Documentacion).options(joinedload(Documentacion.subject)).filter(Documentacion.id == nuevo.id).first()

@router.get("/{documentacion_id}", response_model=DocumentacionResponse)
async def obtener_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentacion = db.query(Documentacion).options(joinedload(Documentacion.subject)).filter(Documentacion.id == documentacion_id).first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion

@router.put("/{documentacion_id}", response_model=DocumentacionOut)
async def actualizar_documentacion(
    documentacion_id: int,
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentacion = db.query(Documentacion).filter(Documentacion.id == documentacion_id).first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    for campo, valor in documentacion_in.model_dump().items():
        setattr(documentacion, campo, valor)
    db.commit()
    db.refresh(documentacion)
    return db.query(Documentacion).options(joinedload(Documentacion.subject)).filter(Documentacion.id == documentacion.id).first()

@router.delete("/{documentacion_id}")
async def eliminar_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentacion = db.query(Documentacion).filter(Documentacion.id == documentacion_id).first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    db.delete(documentacion)
    db.commit()
    return {"message": "Documentación eliminada exitosamente"}