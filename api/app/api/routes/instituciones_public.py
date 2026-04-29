from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models.instituciones import Instituciones
from app.schemas.instituciones import InstitucionesOut, InstitucionesResponse

router = APIRouter(prefix="/instituciones", tags=["instituciones public"])

@router.get("", response_model=InstitucionesResponse)
async def listar_instituciones(db: Session = Depends(get_db)):
    instituciones = db.query(Instituciones).all()
    return {"instituciones": instituciones, "total": len(instituciones)}

@router.get("/{institucion_id}", response_model=InstitucionesOut)
async def obtener_institucion(institucion_id: int, db: Session = Depends(get_db)):
    institucion = db.query(Instituciones).filter(Instituciones.id == institucion_id).first()
    if not institucion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institucion no encontrada"
        )
    return institucion

@router.get("/slug/{slug}", response_model=InstitucionesOut)
def get_instituciones_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una institucion por slug"""
    institucion = db.query(Instituciones).filter(Instituciones.slug == slug).first()
    if not institucion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institucion no encontrada"
        )
    return institucion