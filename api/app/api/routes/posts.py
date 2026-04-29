from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db, verify_csrf
from app.models.posts import Posts
from app.schemas.posts import PostCreate, PostOut, PostResponse
from slugify import slugify

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostResponse])
async def listar_posts(db: Session = Depends(get_db)):
    posts = db.query(Posts).order_by(Posts.fecha.desc()).all()
    return posts 


@router.get("/{post_id}", response_model=PostOut)
async def obtener_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Posts).filter(Posts.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado"
        )
    return post


@router.post("/create", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def crear_post(
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    slug = slugify(post_in.titulo)
    base_slug = slug
    contador = 1
    while db.query(Posts).filter(Posts.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    nuevo = Posts(
        titulo=post_in.titulo,
        resumen=post_in.resumen,
        contenido=post_in.contenido,
        autor=post_in.autor,
        keywords=post_in.keywords,
        fecha=post_in.fecha,
        subject_id=post_in.subject_id,
        slug=slug,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return db.query(Posts).filter(Posts.id == nuevo.id).first()

@router.get("/slug/{slug}", response_model=PostOut)
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


@router.put("/{post_id}", response_model=PostOut)
async def actualizar_post(
    post_id: int,
    post_in: PostCreate,
    db: Session = Depends(get_db),
):
    post = db.query(Posts).filter(Posts.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    
    for campo, valor in post_in.model_dump().items():
        setattr(post, campo, valor)
    
    db.commit()
    db.refresh(post)
    
    return db.query(Posts).filter(Posts.id == post_id).first()

@router.delete("/{post_id}")
async def eliminar_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(verify_csrf),
):
    post = db.query(Posts).filter(Posts.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado"
        )
    db.delete(post)
    db.commit()
    return {"message": "Post eliminado exitosamente"}