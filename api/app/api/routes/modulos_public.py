from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Modulos
from app.schemas.modulos import ModulosResponse

router = APIRouter(prefix="/modulos", tags=["modulos"])

@router.get("/", response_model=ModulosResponse)
def read_modulos(
    db: Session = Depends(get_db),
):
    """Obtener todos los modulos"""
    modulos = db.query(Modulos).all()
    return {
        "modulos": modulos,
        "total": len(modulos),
    }