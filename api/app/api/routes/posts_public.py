from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Posts
from app.schemas.posts import PostList, PostOut, PostResponse


def _obtener_post_por_identificador(db: Session, identificador: str):
    if identificador.isdigit():
        return db.get(Posts, int(identificador))
    return db.execute(
        select(Posts).where(Posts.slug == identificador)
    ).scalar_one_or_none()

router = APIRouter(prefix="/posts", tags=["portal - posts"])


@router.get("", response_model=PostList)
async def listar_posts(
    db: Session = Depends(get_db),
):
    posts = db.execute(select(Posts)).scalars().all()
    return {
        "posts": posts,
        "total": len(posts),
    }

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


