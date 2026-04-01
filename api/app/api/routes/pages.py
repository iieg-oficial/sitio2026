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

router = APIRouter(prefix="/paginas", tags=["páginas"])


def _slug_from_menu_item(page_id: str, db: Session) -> tuple[str, str]:
    try:
        menu_item = db.query(MenuItem).filter(MenuItem.id == int(page_id)).first()
        if menu_item:
            slug = menu_item.url.strip('/')
            slug = slug if slug else 'home'
            return slug, menu_item.label
    except (ValueError, AttributeError):
        pass
    return f"pagina-{page_id}", "Nueva Página"


@router.get("", response_model=list[PageResponse])
def list_pages(db: Session = Depends(get_db)):
    return db.query(Page).all()

@router.get("/{page_id}", response_model=PageResponse)
def get_page_admin(page_id: int, db: Session = Depends(get_db)):
    page = db.query(Page).get(page_id)
    if not page:
        raise HTTPException(404)
    return page


@router.post("/create", response_model=PageResponse)
def create_page(data: PageCreate, db: Session = Depends(get_db)):
    if db.query(Page).filter_by(slug=data.slug).first():
        raise HTTPException(400, "El slug ya existe")
    page = Page(**data.model_dump())
    db.add(page)
    db.commit()
    db.refresh(page)
    return page

@router.put("/{page_id}", response_model=PageResponse)
def update_page(page_id: int, data: PageCreate, db: Session = Depends(get_db)):
    page = db.query(Page).get(page_id)
    if not page:
        raise HTTPException(404, "Página no encontrada")
    for key, val in data.model_dump().items():
        setattr(page, key, val)
    db.commit()
    db.refresh(page)
    return page

@router.delete("/{page_id}")
def delete_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(Page).get(page_id)
    if not page:
        raise HTTPException(404)
    db.delete(page)
    db.commit()
    return {"ok": True}