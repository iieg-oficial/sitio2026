from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Reportes, Usuario, Subject
from app.models.reportes import PeriocidadEnum, MesEnum
from app.schemas import ReporteCreate, ReporteOut, ReporteResponse, ReporteList

router = APIRouter(prefix="/reportes", tags=["reportes"])

def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

@router.get("", response_model=ReporteList)
async def listar_reportes(
    db: Session = Depends(get_db),
):
    reportes = db.execute(
        select(Reportes).order_by(Reportes.titulo)
    ).scalars().all()
    return {
        "reportes": reportes,
        "total": len(reportes),
    }

@router.post("/create", response_model=ReporteOut, status_code=status.HTTP_201_CREATED)
async def crear_reporte(
    reporte_in: ReporteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(reporte_in.titulo)
    base_slug = slug
    contador = 1
    while db.execute(
        select(Reportes).where(Reportes.slug == slug)
    ).scalars().first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    nuevo = Reportes(
        titulo=reporte_in.titulo,
        fecha=reporte_in.fecha,    
        periocidad=reporte_in.periocidad,
        mes=reporte_in.mes,
        anyo=reporte_in.anyo,
        archivo=reporte_in.archivo,
        claves=reporte_in.claves,
        slug=slug,
    )
    nuevo.temas = _load_temas(db, reporte_in.tema_ids or [])

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/periocidad")
def listar_periocidades():
    return {
        "periocidad": {
            periocidad.name: periocidad.value for periocidad in PeriocidadEnum
        }
    }


@router.get("/meses")
def listar_meses():
    return {
        "meses": {
            mes.name: mes.value for mes in MesEnum
        }
    }


@router.get("/slug/{slug}", response_model=ReporteOut)
def get_reporte_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un reporte por slug"""
    reporte = db.execute(
        select(Reportes).where(Reportes.slug == slug)
    ).scalars().first()
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    return reporte


@router.get("/{reporte_id}", response_model=ReporteResponse)
async def obtener_reporte(
    reporte_id: int, 
    db: Session = Depends(get_db),
):
    reporte = db.get(Reportes, reporte_id)
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    return reporte

@router.patch("/{reporte_id}", response_model=ReporteOut)
async def actualizar_reporte(
    reporte_id: int,
    reporte_in: ReporteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    reporte = db.get(Reportes, reporte_id)
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    
    update_data = reporte_in.dict(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != reporte.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.execute(
            select(Reportes).where(Reportes.slug == slug)
        ).scalars().first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    if "tema_ids" in update_data:
        reporte.temas = _load_temas(db, update_data.pop("tema_ids") or [])
    
    for campo, valor in update_data.items():
        setattr(reporte, campo, valor)

    db.commit()
    db.refresh(reporte)
    return reporte

@router.delete("/{reporte_id}")
async def eliminar_reporte(
    reporte_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    reporte = db.get(Reportes, reporte_id)
    if not reporte:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    db.delete(reporte)
    db.commit()
    return reporte


