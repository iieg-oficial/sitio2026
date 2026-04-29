from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from slugify import slugify
from app.api.deps import get_db
from app.models import Reportes
from app.schemas import ReporteOut, ReporteResponse, ReporteList

router = APIRouter(prefix="/reportes", tags=["reportes - public"])

@router.get("", response_model=ReporteList)
async def listar_reportes(
    db: Session = Depends(get_db),
):
    reportes = db.query(Reportes).options(joinedload(Reportes.subject)).all()
    return {
        "reportes": reportes,
        "total": len(reportes),
    }

@router.get("/{reporte_id}", response_model=ReporteResponse)
async def obtener_reporte(
    reporte_id: int, 
    db: Session = Depends(get_db),
):
    reporte = db.query(Reportes).options(joinedload(Reportes.subject)).filter(Reportes.id == reporte_id).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    return reporte

@router.get("/slug/{slug}", response_model=ReporteOut)
def get_reporte_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un reporte por slug"""
    reporte = db.query(Reportes).filter(Reportes.slug == slug).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    return reporte