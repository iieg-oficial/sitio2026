from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from slugify import slugify
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.search import escape_like
from app.models import DocsIIEG, Usuario
from app.schemas.docs_iieg import DocsIIEGCreate, DocsIIEGOut, DocsIIEGResponse

router = APIRouter(prefix="/docs_iieg", tags=["docs_iieg"])

@router.get("/", response_model=DocsIIEGResponse)
def get_docs_iieg(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = select(DocsIIEG)

    if search:
        like = f"%{escape_like(search)}%"
        query = query.where(
            or_(
                DocsIIEG.nombre.ilike(like, escape='\\'),
                DocsIIEG.descripcion.ilike(like, escape='\\'),
            )
        )

    total = db.execute(
            select(func.count()).select_from(query.subquery())
        ).scalar_one()

    docs_iieg = db.execute(
        query.order_by(DocsIIEG.fecha.desc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
    ).scalars().all()

    return {"docs_iieg": docs_iieg, "total": total}

@router.post("/create", response_model=DocsIIEGOut)
def create_docs_iieg(
    docs_iieg: DocsIIEGCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(docs_iieg.nombre)
    base_slug = slug
    contador = 1
    while db.query(DocsIIEG).filter(DocsIIEG.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    """Crear un nuevo documento del IIEG"""
    db_docs_iieg = DocsIIEG(
        nombre=docs_iieg.nombre,
        descripcion=docs_iieg.descripcion,
        tipo=docs_iieg.tipo,
        imagen=docs_iieg.imagen,
        link=docs_iieg.link,
        documento=docs_iieg.documento,
        fecha=docs_iieg.fecha,
        slug=slug,
    )
    db.add(db_docs_iieg)
    db.commit()
    db.refresh(db_docs_iieg)
    return db_docs_iieg

@router.patch("/{docs_iieg_id}", response_model=DocsIIEGOut)
def update_docs_iieg(
    docs_iieg_id: int,
    docs_iieg: DocsIIEGCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un documento del IIEG"""
    db_docs_iieg = db.query(DocsIIEG).filter(DocsIIEG.id == docs_iieg_id).first()
    if not db_docs_iieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento del IIEG no encontrado",
        )
    db_docs_iieg.nombre = docs_iieg.nombre
    db_docs_iieg.descripcion = docs_iieg.descripcion
    db_docs_iieg.tipo = docs_iieg.tipo
    db_docs_iieg.imagen = docs_iieg.imagen
    db_docs_iieg.link = docs_iieg.link
    db_docs_iieg.documento = docs_iieg.documento
    db_docs_iieg.fecha = docs_iieg.fecha
    db_docs_iieg.slug = slugify(docs_iieg.nombre)

    db.commit()
    db.refresh(db_docs_iieg)
    return db_docs_iieg

@router.delete("/{docs_iieg_id}", response_model=DocsIIEGOut)
def delete_docs_iieg(
    docs_iieg_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un documento del IIEG"""
    db_docs_iieg = db.query(DocsIIEG).filter(DocsIIEG.id == docs_iieg_id).first()
    if not db_docs_iieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento del IIEG no encontrado",
        )
    db.delete(db_docs_iieg)
    db.commit()
    return db_docs_iieg

@router.get("/slug/{slug}", response_model=DocsIIEGOut)
def get_docs_iieg_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un documento del IIEG por slug"""
    db_docs_iieg = db.query(DocsIIEG).filter(DocsIIEG.slug == slug).first()
    if not db_docs_iieg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento del IIEG no encontrado",
        )
    return db_docs_iieg

@router.get("/tipo/{tipo}", response_model=DocsIIEGResponse)
def get_docs_iieg_tipo(
    tipo: str,
    db: Session = Depends(get_db),
):
    """Obtener documentos del IIEG por tipo"""
    docs_iieg = db.query(DocsIIEG).filter(DocsIIEG.tipo == tipo).all()
    return {"docs_iieg": docs_iieg, "total": len(docs_iieg)}
