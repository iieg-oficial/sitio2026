from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Profesores, Usuario
from app.schemas.profesores import ProfesoresCreate, ProfesoresOut, ProfesoresResponse

router = APIRouter(prefix="/profesores", tags=["profesores"])


@router.get("", response_model=ProfesoresResponse)
def listar_profesores(
    db: Session = Depends(get_db),
):
    """Obtener todos los profesores"""
    profesores = db.query(Profesores).order_by(Profesores.id.desc()).all()
    return {
        "profesores": profesores,
        "total": len(profesores),
    }


@router.post("/create", response_model=ProfesoresOut, status_code=status.HTTP_201_CREATED)
def crear_profesor(
    profesor_in: ProfesoresCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Crear un nuevo profesor"""
    slug = slugify(profesor_in.nombre)
    base_slug = slug
    contador = 1
    while db.query(Profesores).filter(Profesores.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    nuevo = Profesores(
        nombre=profesor_in.nombre,
        descripcion=profesor_in.descripcion,
        puesto=profesor_in.puesto,
        foto=profesor_in.foto,
        slug=slug,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/slug/{slug}", response_model=ProfesoresOut)
def get_profesor_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un profesor por su slug (se coloca antes de /{profesor_id} para evitar colisión)"""
    profesor = db.query(Profesores).filter(Profesores.slug == slug).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    return profesor


@router.get("/{profesor_id}", response_model=ProfesoresOut)
def obtener_profesor(
    profesor_id: int,
    db: Session = Depends(get_db),
):
    """Obtener un profesor por ID"""
    profesor = db.query(Profesores).filter(Profesores.id == profesor_id).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    return profesor


@router.patch("/{profesor_id}", response_model=ProfesoresOut)
def actualizar_profesor(
    profesor_id: int,
    profesor_in: ProfesoresCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un profesor existente"""
    profesor = db.query(Profesores).filter(Profesores.id == profesor_id).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )

    update_data = profesor_in.model_dump(exclude_unset=True)

    if "nombre" in update_data and update_data["nombre"] != profesor.nombre:
        slug = slugify(update_data["nombre"])
        base_slug = slug
        contador = 1
        while db.query(Profesores).filter(Profesores.slug == slug, Profesores.id != profesor_id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data:
        if update_data["slug"]:
            update_data["slug"] = make_unique_slug(
                db, Profesores, update_data["slug"], exclude_id=profesor_id
            )
        else:
            del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(profesor, campo, valor)

    db.commit()
    db.refresh(profesor)
    return profesor


@router.delete("/{profesor_id}")
def eliminar_profesor(
    profesor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un profesor"""
    profesor = db.query(Profesores).filter(Profesores.id == profesor_id).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    db.delete(profesor)
    db.commit()
    return {"message": "Profesor eliminado exitosamente"}