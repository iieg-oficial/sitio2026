from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.search import escape_like
from app.core.slugs import make_unique_slug
from app.models import Reportes, Subject, Usuario
from app.models.reportes import MesEnum, PeriocidadEnum
from app.schemas import ReporteCreate, ReporteList, ReporteOut, ReporteResponse

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
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
    db: Session = Depends(get_db),
):
    query = select(Reportes)

    if search:
        like = f"%{escape_like(search)}%"
        query = query.where(
            or_(
                Reportes.titulo.ilike(like, escape='\\'),
                Reportes.claves.ilike(like, escape='\\'),
            )
        )

    # total antes de paginar
    total = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    reportes = db.execute(
        query.order_by(Reportes.titulo, Reportes.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).scalars().all()

    return {
        "reportes": reportes,
        "total": total,
    }

@router.post("/create", response_model=ReporteOut, status_code=status.HTTP_201_CREATED)
async def crear_reporte(
    reporte_in: ReporteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = make_unique_slug(db, Reportes, reporte_in.titulo)

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
        update_data["slug"] = make_unique_slug(
            db, Reportes, update_data["titulo"], exclude_id=reporte_id
        )
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Reportes, update_data["slug"], exclude_id=reporte_id
            )
        else:
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


