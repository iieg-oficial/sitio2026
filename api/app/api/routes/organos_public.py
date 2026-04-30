from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from slugify import slugify
from app.schemas.organos import OrganosResponse, OrganosOut
from app.models import Organos
from app.api.deps import get_db

router = APIRouter(prefix="/organos", tags=["organos - publico"])

@router.get("/", response_model=OrganosResponse)
def read_organos(
    db: Session = Depends(get_db),
):
    organos = db.query(Organos).all()
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