from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import DatosNuevos, Usuario     

router = APIRouter(prefix="/datos-nuevos", tags=["datos-nuevos-public"])  

@router.get("/", response_model=DatosNuevosResponse)
def read_datos_nuevos(
    db: Session = Depends(get_db),
):
    """Obtener todos los datos nuevos"""
    datos_nuevos = db.query(DatosNuevos).all()
    return {
        "datos_nuevos": datos_nuevos,
        "total": len(datos_nuevos),
    }

