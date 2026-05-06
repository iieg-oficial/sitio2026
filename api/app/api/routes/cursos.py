from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.api.deps import get_current_user, get_db
from app.models import Cursos, Usuario, Modulos, Instituciones, Perfiles, Profesores, Subject
from app.schemas.cursos import CursosCreate, CursosOut, CursosResponse, CursosList
from slugify import slugify

router = APIRouter(prefix="/cursos", tags=["cursos"])

def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

def _load_modulos(db: Session, modulo_ids: list[int]) -> list[Modulos]:
    if not modulo_ids:
        return []
    return db.execute(
        select(Modulos).where(Modulos.id.in_(modulo_ids))
    ).scalars().all()

def _load_instituciones(db: Session, instituciones_ids: list[int]) -> list[Instituciones]:
    if not instituciones_ids:
        return []
    return db.execute(
        select(Instituciones).where(Instituciones.id.in_(instituciones_ids))
    ).scalars().all()

def _load_perfiles(db: Session, perfiles_ids: list[int]) -> list[Perfiles]:
    if not perfiles_ids:
        return []
    return db.execute(
        select(Perfiles).where(Perfiles.id.in_(perfiles_ids))
    ).scalars().all()

def _load_profesores(db: Session, profesores_ids: list[int]) -> list[Profesores]:
    if not profesores_ids:
        return []
    return db.execute(
        select(Profesores).where(Profesores.id.in_(profesores_ids))
    ).scalars().all()
    

@router.get("", response_model=CursosList)
def get_cursos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los cursos con sus relaciones"""
    cursos = db.execute(select(Cursos)).scalars().all()
    return {"cursos": cursos, "total": len(cursos)}


@router.post("/create", response_model=CursosOut, status_code=status.HTTP_201_CREATED)
def create_cursos(
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Generar slug único
    slug = slugify(cursos.titulo)
    base_slug = slug
    contador = 1

    while db.execute(select(Cursos).where(Cursos.slug == slug)).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    db_cursos = Cursos(
        titulo=cursos.titulo,
        descripcion=cursos.descripcion,
        inicio=cursos.inicio,
        formato=cursos.formato,
        Horario=cursos.Horario,
        Objetivo=cursos.Objetivo,
        p_ingreso=cursos.p_ingreso,
        p_egreso=cursos.p_egreso,
        tipo_curso=cursos.tipo_curso,
        inscripcion=cursos.inscripcion,
        acreditacion=cursos.acreditacion,
        vigencia=cursos.vigencia,
        contacto=cursos.contacto,
        destacado=cursos.destacado,
        claves=cursos.claves,
        slug=slug,
    )
    
    db_cursos.modulos = _load_modulos(db, cursos.modulo_ids)
    db_cursos.instituciones = _load_instituciones(db, cursos.instituciones_ids)
    db_cursos.perfiles = _load_perfiles(db, cursos.perfiles_ids)
    db_cursos.profesores = _load_profesores(db, cursos.profesores_ids)
    db_cursos.temas = _load_temas(db, cursos.tema_ids)

    db.add(db_cursos)
    db.flush()
    
    db.commit()
    db.refresh(db_cursos)

    return db_cursos


@router.get("/slug/{slug}", response_model=CursosOut)
def get_cursos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un curso por slug con sus relaciones"""
    db_cursos = db.execute(select(Cursos).where(Cursos.slug == slug)).scalar_one_or_none()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    return db_cursos


@router.put("/{curso_id}", response_model=CursosOut)
def update_cursos(
    curso_id: int,
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un curso"""
    db_cursos = db.execute(select(Cursos).where(Cursos.id == curso_id)).scalar_one_or_none()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )

    update_data = cursos.model_dump(exclude_unset=True)
    
    if "titulo" in update_data and update_data["titulo"] != db_cursos.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1

        while db.execute(select(Cursos).where(Cursos.slug == slug)).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    if "tema_ids" in update_data:
        db_cursos.temas = _load_temas(db, update_data.pop("tema_ids") or [])

    if "modulo_ids" in update_data:
        db_cursos.modulos = _load_modulos(db, update_data.pop("modulo_ids") or [])

    if "instituciones_ids" in update_data:
        db_cursos.instituciones = _load_instituciones(db, update_data.pop("instituciones_ids") or [])

    if "perfiles_ids" in update_data:
        db_cursos.perfiles = _load_perfiles(db, update_data.pop("perfiles_ids") or [])

    if "profesores_ids" in update_data:
        db_cursos.profesores = _load_profesores(db, update_data.pop("profesores_ids") or [])

    # Actualizar solo campos escalares (NO incluir las relaciones many-to-many)
    campos_escalares = [
        "titulo", "descripcion", "inicio", "formato", "Horario", "Objetivo",
        "p_ingreso", "p_egreso", "tipo_curso", "inscripcion", "acreditacion",
        "vigencia", "contacto", "destacado", "claves"
    ]
    for campo in campos_escalares:
        valor = getattr(cursos, campo, None)
        if valor is not None:
            setattr(db_cursos, campo, valor)

    db.commit()
    db.refresh(db_cursos)


    return db_cursos


@router.delete("/{curso_id}", response_model=CursosOut)
def delete_cursos(
    curso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un curso"""
    db_cursos = db.execute(select(Cursos).where(Cursos.id == curso_id)).scalar_one_or_none()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    db.delete(db_cursos)
    db.commit()
    return db_cursos