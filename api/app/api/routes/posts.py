from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from slugify import slugify
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.core.search import escape_like
from app.models import Posts, Subject, Usuario
from app.models.posts import GalleryImage
from app.schemas.posts import PostCreate, PostList, PostOut, PostResponse

router = APIRouter(prefix="/posts", tags=["posts"])
UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def _obtener_post_por_identificador(db: Session, identificador: str):
    if identificador.isdigit():
        return db.get(Posts, int(identificador))
    return db.execute(
        select(Posts).where(Posts.slug == identificador)
    ).scalar_one_or_none()


def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()


@router.get("", response_model=PostList)
async def listar_posts(
    response: Response,
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
    db: Session = Depends(get_db),
):
    # Deshabilitar caché del navegador
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"

    query = select(Posts)

    if search:
        like = f"%{escape_like(search)}%"
        query = query.where(
            or_(
                Posts.titulo.ilike(like, escape='\\'),
                Posts.resumen.ilike(like, escape='\\'),
            )
        )

    total = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    # Ordenar por ID descendente (el más reciente capturado primero)
    posts = db.execute(
        query.order_by(Posts.id.desc(), Posts.fecha.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).scalars().all()

    return {"posts": posts, "total": total}


@router.get("/{post_id}", response_model=PostResponse)
async def obtener_post(
    post_id: str,
    db: Session = Depends(get_db),
):
    post = _obtener_post_por_identificador(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado"
        )
    return post


@router.post("/create", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def crear_post(
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(post_in.titulo)
    base_slug = slug
    contador = 1

    while db.execute(select(Posts).where(Posts.slug == slug)).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    nuevo = Posts(
        titulo=post_in.titulo,
        resumen=post_in.resumen,
        contenido=post_in.contenido,
        autor=post_in.autor,
        claves=post_in.claves,
        fecha=post_in.fecha,
        slug=slug,
        video=post_in.video,
    )
    nuevo.temas = _load_temas(db, post_in.tema_ids or [])


    db.add(nuevo)

    db.flush()
    for i, url in enumerate(post_in.gallery_urls):
        nuevo.gallery_images.append(
            GalleryImage(url=url, order=i)
        )

    db.commit()
    db.refresh(nuevo)

    return nuevo

@router.get("/slug/{slug}", response_model=PostOut)
async def obtener_post_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    post = db.execute(select(Posts).where(Posts.slug == slug)).scalar_one_or_none()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado"
        )
    return post


@router.patch("/{post_id}", response_model=PostOut)
async def actualizar_post(
    post_id: int,
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    post = db.get(Posts, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")

    update_data = post_in.dict(exclude_unset=True)
    if "titulo" in update_data and update_data["titulo"] != post.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Posts).filter(Posts.slug == slug).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Posts, update_data["slug"], exclude_id=post_id
            )
        else:
            del update_data["slug"]

    if "tema_ids" in update_data:
        post.temas = _load_temas(db, update_data.pop("tema_ids") or [])

    if "gallery_urls" in update_data:
        gallery_urls = update_data.pop("gallery_urls") or []
        post.gallery_images.clear()
        db.flush()
        for i, url in enumerate(gallery_urls):
            post.gallery_images.append(GalleryImage(url=url, order=i))

    for campo, valor in update_data.items():
        setattr(post, campo, valor)

    db.commit()
    db.refresh(post)

    return post

@router.delete("/{post_id}")
async def eliminar_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    post = db.get(Posts, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado"
        )
    db.delete(post)
    db.commit()
    return post
