from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db
from app.models import Modulos
from app.schemas.modulos import ModulosResponse, ModulosOut

router = APIRouter(prefix="/modulos", tags=["modulos - public"])

@router.get("", response_model=ModulosResponse)
def read_modulo(db: Session = Depends(get_db)):
    modulos = db.query(Modulos).all()
    return {
        "modulos": modulos,
        "total": len(modulos),
    }

@router.get("/slug/{slug}", response_model=ModulosOut)
def get_modulos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un modulo por slug"""
    modulo = db.query(Modulos).filter(Modulos.slug == slug).first()
    if not modulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Modulo no encontrado"
        )
    return modulo