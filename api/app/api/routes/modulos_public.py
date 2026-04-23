from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Modulo
from app.schemas.modulo import ModuloResponse

router = APIRouter(prefix="/modulo", tags=["modulo - public"])

@router.get("", response_model=ModuloResponse)
def read_modulo(db: Session = Depends(get_db)):
    modulo = db.query(Modulo).all()
    return {
        "modulo": modulo,
        "total": len(modulo),
    }