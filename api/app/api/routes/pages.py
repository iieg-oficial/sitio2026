from slugify import slugify
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models.menu_item import MenuItem
from app.models.page import Page
from app.models.user import Usuario
from app.schemas.page import PageCreate, PageResponse, PageUpdate, PageResponseList, PageTreeOut, PageFlat

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


@router.get("", response_model=PageResponseList)
def list_pages(
    db: Session = Depends(get_db),
):
    return {
        "pages": db.query(Page).all(), 
        "total": db.query(Page).count()
    }


@router.post("/create", response_model=PageResponse)
def create_page(
    data: PageCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    if data.parent_id:
        parent = db.query(Page).get(data.parent_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Página padre no encontrada"
            )
        if parent.parent_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="No se pueden crear páginas hijas de páginas hijas"
            )
    
    base_slug = slugify(data.slug_custom)
    slug = base_slug
    contador = 1

    while db.query(Page).filter(Page.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    page_data = data.model_dump(exclude={"slug"})
    page = Page(**page_data, slug=slug)
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.put("/{page_id}", response_model=PageUpdate)
def update_page(
    page_id: int, 
    data: PageCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    page = db.get(Page, page_id)
    if not page:
        raise HTTPException(404, "Página no encontrada")

    if (data.parent_id == page.id):
        raise HTTPException(400, "No se puede asignar una página como su propio padre")
    
    
    update_data = data.model_dump(exclude_unset=True)

    if "title" in update_data and update_data["title"] != page.title:
        base_slug = slugify(update_data["title"])
        slug = base_slug
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
def delete_page(
    page_id: int, db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
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


@router.get("/tree", response_model=list[PageFlat])
def get_pages_tree(
    db: Session = Depends(get_db),
):
    """Obtener páginas en formato tree"""
    pages = db.execute(select(Page).where(Page.parent_id == None)).scalars().all()
    return pages


@router.get("/padres", response_model=list[PageFlat])
async def obtener_paginas_padres(
    db: Session = Depends(get_db)
):
    pages = db.execute(select(Page)).scalars().all()
    return pages


@router.get("/{page_id}", response_model=PageResponse)
def get_page_admin(
    page_id: int, db: Session = Depends(get_db),
):
    page = db.query(Page).get(page_id)
    if not page:
        raise HTTPException(404)
    return page
