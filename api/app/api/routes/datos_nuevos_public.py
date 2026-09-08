from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import DatosNuevos
from app.schemas.datos_nuevos import DatosNuevosOut, DatosNuevosResponse

router = APIRouter(prefix="/datos-nuevos", tags=["datos-nuevos-public"])

@router.get("", response_model=DatosNuevosResponse)
def read_datos_nuevos(
    db: Session = Depends(get_db),
):
    """Obtener todos los datos nuevos"""
    datos_nuevos = db.query(DatosNuevos).all()
    return {
        "datos_nuevos": datos_nuevos,
        "total": len(datos_nuevos),
    }

@router.get("/slug/{slug}", response_model=DatosNuevosOut)
def get_datos_nuevos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un dato nuevo por slug"""
    datos_nuevos = db.query(DatosNuevos).filter(DatosNuevos.slug == slug).first()
    if not datos_nuevos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dato nuevo no encontrado"
        )
    return datos_nuevos
