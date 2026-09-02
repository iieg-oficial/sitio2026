from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api.deps import get_db
from app.models.page import Page
from app.schemas.page import PageResponse, PageUpdate, PageResponseList

router = APIRouter(prefix="/paginas", tags=["páginas - portal"])


@router.get("", response_model=PageResponseList)
def list_pages(db: Session = Depends(get_db)):
    return {
        "pages": db.query(Page).all(), 
        "total": db.query(Page).count()
    }


@router.get("/slug/{slug}", response_model=PageUpdate)
def get_page_by_slug(slug: str, db: Session = Depends(get_db)):
    # En Python se usa startswith (minúsculas)
    slug_search = slug if slug.startswith("/") else f"/{slug}"
    
    page = db.query(Page).filter(
        or_(
            Page.slug == slug,
            Page.slug_custom == slug,
            Page.slug_custom == slug_search
        )
    ).first()
    
    if not page:
        raise HTTPException(status_code=404, detail="Página no encontrada")
        
    return page
