from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models.posts import Posts
from app.schemas.posts import PostOut, PostResponse

router = APIRouter(prefix="/posts", tags=["portal - posts"])


@router.get("", response_model=list[PostResponse])
async def listar_posts_publicos(db: Session = Depends(get_db)):
    posts = db.query(Posts).options(joinedload(Posts.subject)).order_by(Posts.fecha.desc()).all()
    return posts 

@router.get("/{slug}", response_model=PostOut)
async def obtener_post_slug(
    slug: str, 
    db: Session = Depends(get_db)
):
    post = db.query(Posts).filter(Posts.slug == slug).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado"
        )
    return post