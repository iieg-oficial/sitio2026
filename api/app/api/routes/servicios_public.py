from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models import Servicios
from app.schemas import ServiciosOut, ServiciosResponse

router = APIRouter(prefix="/servicios", tags=["public - servicios"])

@router.get("", response_model=ServiciosResponse)
def listar_servicios(
    db: Session = Depends(get_db),
    skip: int = 0,
):
    servicios = (
        db.query(Servicios)
        .order_by(Servicios.id.desc())
        .offset(skip)
        .all()
    )

    return {
        "servicios": servicios,
        "total": len(servicios),
    }

@router.get("/{slug}", response_model=ServiciosOut)
def obtener_servicio_por_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    servicio = db.query(Servicios).filter(Servicios.slug == slug).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio