from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Reportes, Usuario
from app.schemas import ReporteCreate, ReporteOut, ReporteResponse, ReporteList

router = APIRouter(prefix="/reportes", tags=["reportes"])

@router.get("", response_model=ReporteList)
async def listar_reportes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reportes = db.query(Reportes).options(joinedload(Reportes.subject)).all()
    return {
        "reportes": reportes,
        "total": len(reportes),
    }

@router.post("/create", response_model=ReporteOut, status_code=status.HTTP_201_CREATED)
async def crear_reporte(
    reporte_in: ReporteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    nuevo = Reportes(
        titulo=reporte_in.titulo,
        fecha=reporte_in.fecha,
        descripcion=reporte_in.descripcion,
        subject_id=reporte_in.subject_id,
        periocidad=reporte_in.periocidad,
        archivo=reporte_in.archivo,
        subtema=reporte_in.subtema,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return db.query(Reportes).options(joinedload(Reportes.subject)).filter(Reportes.id == nuevo.id).first()

@router.get("/{reporte_id}", response_model=ReporteResponse)
async def obtener_reporte(
    reporte_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = db.query(Reportes).options(joinedload(Reportes.subject)).filter(Reportes.id == reporte_id).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    return reporte

@router.put("/{reporte_id}", response_model=ReporteOut)
async def actualizar_reporte(
    reporte_id: int,
    reporte_in: ReporteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = db.query(Reportes).filter(Reportes.id == reporte_id).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    for campo, valor in reporte_in.model_dump().items():
        setattr(reporte, campo, valor)
    db.commit()
    db.refresh(reporte)
    return db.query(Reportes).options(joinedload(Reportes.subject)).filter(Reportes.id == reporte.id).first()

@router.delete("/{reporte_id}")
async def eliminar_reporte(
    reporte_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = db.query(Reportes).filter(Reportes.id == reporte_id).first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    db.delete(reporte)
    db.commit()
    return {"message": "Reporte eliminado exitosamente"}

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