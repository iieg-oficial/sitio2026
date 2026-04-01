from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models.menu_item import MenuItem
from app.models.page import Page
from app.models.user import Usuario
from app.schemas.page import PageCreate, PageResponse, PageUpdate, BlockSchema  

router = APIRouter(prefix="/paginas", tags=["páginas - portal"])


@router.get("", response_model=list[PageResponse])
def list_pages(db: Session = Depends(get_db)):
    return db.query(Page).all()


@router.get("/{slug}", response_model=PageResponse)
def get_page_by_slug(slug: str, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(404)
    return page
