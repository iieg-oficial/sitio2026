from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import Integer, cast, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Documentacion
from app.schemas import DocumentacionList, DocumentacionOut, DocumentacionResponse
from app.services.documentacion import get_tipos as get_documentacion_tipos

router = APIRouter(prefix="/documentacion", tags=["documentacion - public"])


router.add_api_route("/tipos", get_documentacion_tipos, methods=["GET"])

@router.get("", response_model=DocumentacionList)
async def listar_documentaciones(
    response: Response,
    db: Session = Depends(get_db),
):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"

    # Consulta directa ordenando por ID descendente (evita el cast que revienta el SQL)
    documentaciones = db.execute(
        select(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.sistemas)
        )
        .order_by(Documentacion.id.desc())
    ).scalars().unique().all()

    return {
        "documentaciones": documentaciones,
        "total": len(documentaciones),
    }

@router.get("/{documentacion_id}", response_model=DocumentacionResponse)
async def obtener_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
):
    documentacion = db.execute(
        select(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.sistemas)
        )
        .where(Documentacion.id == documentacion_id)
    ).scalars().first()

    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion

@router.get("/slug/{slug}", response_model=DocumentacionOut)
def get_documentacion_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una documentación por slug"""
    documentacion = db.execute(
        select(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.sistemas)
        )
        .where(Documentacion.slug == slug)
    ).scalars().first()

    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion
