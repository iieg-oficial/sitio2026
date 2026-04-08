from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.organos import OrganosResponse
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