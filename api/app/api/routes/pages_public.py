from datetime import datetime
from slugify import slugify
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.page import Page
from app.schemas.page import PageResponse  

router = APIRouter(prefix="/paginas", tags=["páginas - portal"])


@router.get("", response_model=list[PageResponse])
def list_pages(db: Session = Depends(get_db)):
    return db.query(Page).all()


@router.get("/slug/{slug}", response_model=PageResponse)
def get_page_by_slug(slug: str, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(404)
    return page
