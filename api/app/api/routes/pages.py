from datetime import datetime
from slugify import slugify
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models.menu_item import MenuItem
from app.models.page import Page
from app.models.user import Usuario
from app.schemas.page import PageCreate, PageResponse, PageUpdate  

router = APIRouter(prefix="/paginas", tags=["páginas"])


def _slug_from_menu_item(page_id: str, db: Session) -> tuple[str, str]:
    try:
        menu_item = db.query(MenuItem).filter(MenuItem.id == int(page_id)).first()
        if menu_item:
            slug_custom = menu_item.url.strip('/')
            slug = slugify(slug_custom)
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
def create_page(
    data: PageCreate, 
    db: Session = Depends(get_db)
):
    slug = slugify(data.slug_custom)
    base_slug = slug
    contador = 1
    while db.query(Page).filter(Page.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    page = Page(
        title=data.title,
        description=data.description,
        slug_custom=data.slug_custom,
        published_at=data.published_at,
        updated_at=data.updated_at,
        meta_description=data.meta_description,
        meta_keywords=data.meta_keywords,       
        slug=slug,
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page

@router.put("/{page_id}", response_model=PageResponse)
def update_page(
    page_id: int, 
    data: PageCreate, 
    db: Session = Depends(get_db)
):
    page = db.query(Page).get(page_id)
    if not page:
        raise HTTPException(404, "Página no encontrada")

    update_data = data.model_dump(exclude_unset=True)

    if "title" in update_data and update_data["title"] != page.title:
        slug = slugify(update_data["title"])
        base_slug = slug
        contador = 1
        while db.query(Page).filter(Page.slug == slug, Page.id != page_id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    for key, val in update_data.items():
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

@router.get("/slug/{slug}", response_model=PageResponse)
def get_page_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una página por slug"""
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Página no encontrada"
        )
    return page