from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Archivos
from app.schemas.archivo import ArchivoOut, ArchivoResponse

router = APIRouter(prefix="/archivos", tags=["archivos -publicos"])

@router.get("", response_model=list[ArchivoResponse])
async def listar_archivos_publicos(db: Session = Depends(get_db)):
    archivos = db.query(Archivos).options(joinedload(Archivos.subject)).order_by(Archivos.fecha.desc()).all()
    return archivos

@router.get("/institucionales", response_model=list[ArchivoResponse])
async def listar_archivos_institucionales(db: Session = Depends(get_db)):
    archivos_institucionales = db.query(Archivos).options(joinedload(Archivos.subject)).filter(Archivos.tipo == 1).order_by(Archivos.fecha.desc()).all()
    return archivos_institucionales

@router.get("/contabilidad", response_model=list[ArchivoResponse])
async def listar_archivos_contabilidad(db: Session = Depends(get_db)):
    archivos_contabilidad = db.query(Archivos).options(joinedload(Archivos.subject)).filter(Archivos.tipo == 2).order_by(Archivos.fecha.desc()).all()
    return archivos_contabilidad

@router.get("/{archivo_id}", response_model=ArchivoOut)
async def obtener_archivo_publico(archivo_id: int, db: Session = Depends(get_db)):
    archivo = db.query(Archivos).options(joinedload(Archivos.subject)).filter(Archivos.id == archivo_id).first()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    return archivo
    