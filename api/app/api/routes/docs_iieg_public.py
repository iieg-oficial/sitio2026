from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import DocsIIEG
from app.schemas.docs_iieg import DocsIIEGOut, DocsIIEGResponse

router = APIRouter(prefix="/docs_iieg", tags=["docs_iieg_public"])

@router.get("", response_model=DocsIIEGResponse)
def get_docs_iieg(
    db: Session = Depends(get_db),
):
    """Obtener todos los documentos del IIEG ordenados del más reciente al más antiguo"""
    docs_iieg = db.query(DocsIIEG).order_by(DocsIIEG.id.desc()).all()
    return {"docs_iieg": docs_iieg, "total": len(docs_iieg)}


@router.get("/tipo/{tipo}", response_model=DocsIIEGResponse)
def get_docs_iieg_tipo(
    tipo: str,
    db: Session = Depends(get_db),
):
    """Obtener documentos del IIEG por tipo ordenados del más reciente al más antiguo"""
    docs_iieg = db.query(DocsIIEG).filter(DocsIIEG.tipo == tipo).order_by(DocsIIEG.id.desc()).all()
    return {"docs_iieg": docs_iieg, "total": len(docs_iieg)}

@router.get("/slug/{slug}", response_model=DocsIIEGOut)
def get_docs_iieg_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    db_docs_iieg = db.query(DocsIIEG).filter(DocsIIEG.slug == slug).first()
    if not db_docs_iieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento del IIEG no encontrado",
        )
    return db_docs_iieg