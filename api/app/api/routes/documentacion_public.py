from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_db
from app.models import Documentacion
from app.schemas import DocumentacionOut, DocumentacionResponse, DocumentacionList

router = APIRouter(prefix="/documentacion", tags=["documentacion - public"])

@router.get("", response_model=DocumentacionList)
async def listar_documentaciones(
    db: Session = Depends(get_db),
):
    documentaciones = db.execute(select(Documentacion).order_by(Documentacion.fecha.desc())).scalars().all()
    return {
        "documentaciones": documentaciones,
        "total": len(documentaciones),
    }

@router.get("/{documentacion_id}", response_model=DocumentacionResponse)
async def obtener_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
):
    documentacion = db.execute(select(Documentacion).filter(Documentacion.id == documentacion_id)).scalar_one_or_none()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion

@router.get("/slug/{slug}", response_model=DocumentacionOut)
def get_documentacion_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una documentación por slug"""
    documentacion = db.execute(select(Documentacion).filter(Documentacion.slug == slug)).scalar_one_or_none()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion