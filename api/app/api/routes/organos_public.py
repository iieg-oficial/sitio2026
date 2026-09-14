from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Organos
from app.schemas.organos import OrganosOut, OrganosResponse

router = APIRouter(prefix="/organos", tags=["organos - publico"])

@router.get("", response_model=OrganosResponse)
def read_organos(
    db: Session = Depends(get_db),
):
    organos = db.query(Organos).order_by(Organos.id.asc()).all()
    return {
        "organos": organos,
        "total": len(organos),
    }

@router.get("/slug/{slug}", response_model=OrganosOut)
def get_organos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un organo por slug"""
    organo = db.query(Organos).filter(Organos.slug == slug).first()
    if not organo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organo no encontrado"
        )
    return organo
