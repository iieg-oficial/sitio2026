from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_db
from app.models import Archivos
from app.schemas.archivo import ArchivoOut, ArchivoResponse

router = APIRouter(prefix="/archivos", tags=["archivos -publicos"])

@router.get("", response_model=list[ArchivoResponse])
async def listar_archivos_publicos(db: Session = Depends(get_db)):
    archivos = db.execute(select(Archivos).order_by(Archivos.id.asc())).scalars().all()
    return archivos

@router.get("/institucionales", response_model=list[ArchivoResponse])
async def listar_archivos_institucionales(db: Session = Depends(get_db)):
    archivos_institucionales = db.execute(select(Archivos).filter(Archivos.tipo == "institucional").order_by(Archivos.id.asc())).scalars().all()
    return archivos_institucionales

@router.get("/contabilidad", response_model=list[ArchivoResponse])
async def listar_archivos_contabilidad(db: Session = Depends(get_db)):
    archivos_contabilidad = db.execute(select(Archivos).filter(Archivos.tipo == "contabilidad").order_by(Archivos.id.asc())).scalars().all()
    return archivos_contabilidad

@router.get("/{archivo_id}", response_model=ArchivoOut)
async def obtener_archivo_publico(archivo_id: int, db: Session = Depends(get_db)):
    archivo = db.execute(select(Archivos).filter(Archivos.id == archivo_id)).scalar_one_or_none()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    return archivo
    
@router.get("/slug/{slug}", response_model=ArchivoOut)
def get_archivos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un archivo por slug"""
    archivo = db.execute(select(Archivos).filter(Archivos.slug == slug)).scalar_one_or_none()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    return archivo