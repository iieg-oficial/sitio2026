from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.models import Subject, Usuario
from app.schemas.subject import SubjectCreate, SubjectFlat, SubjectOut

router = APIRouter(prefix="/subject", tags=["temas"])


@router.get("/tree", response_model=list[SubjectOut])
async def obtener_temas_tree(
    db: Session = Depends(get_db)):
    temas = db.execute(select(Subject).where(Subject.parent_id.is_not(None))).scalars().all()
    return temas

@router.get("", response_model=list[SubjectFlat])
async def listar_subjects(
    db: Session = Depends(get_db)
):
    subjects = db.execute(select(Subject)).scalars().all()
    return subjects


@router.get("/{subject_id}", response_model=SubjectOut)
async def obtener_subject(
    subject_id: int,
    db: Session = Depends(get_db)
):
    subject = db.execute(select(Subject).where(Subject.id == subject_id)).scalar_one_or_none()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject no encontrado"
        )
    return subject


@router.post("/create", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def crear_subject(
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    if subject_in.parent_id:
        parent_exists = db.get(Subject, subject_in.parent_id)
        if not parent_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Parent no encontrado"
            )

    base_slug = slugify(subject_in.titulo)
    slug = base_slug
    contador = 1

    while db.execute(select(Subject).where(Subject.slug == slug)).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    nuevo = Subject(**subject_in.model_dump(exclude={"slug"}), slug=slug)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{subject_id}", response_model=SubjectOut)
async def actualizar_subject(
    subject_id: int,
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject no encontrado")

    if(subject_in.parent_id == subject.id):
        raise HTTPException(status_code=400, detail="No se puede asignar un subject como su propio padre")

    update_data = subject_in.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != subject.titulo:
        base_slug = slugify(update_data["titulo"])
        slug = base_slug
        contador = 1
        while db.execute(select(Subject).where(Subject.slug == slug, Subject.id != subject_id)).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug

    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(subject, campo, valor)

    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/{subject_id}")
async def eliminar_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    subject = db.execute(select(Subject).where(Subject.id == subject_id)).scalar_one_or_none()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject no encontrado"
        )
    db.delete(subject)
    db.commit()
    return subject


@router.get("/slug/{slug}", response_model=SubjectOut)
def get_subject_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un subject por slug"""
    subject = db.query(Subject).filter(Subject.slug == slug).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject no encontrado"
        )
    return subject
