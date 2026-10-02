from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, verify_csrf
from app.core.slugs import make_unique_slug
from app.models import Cursos, Instituciones, Modulos, Perfiles, Profesores, Subject, Usuario
from app.schemas.cursos import CursosCreate, CursosOut, CursosResponse

router = APIRouter(prefix="/cursos", tags=["cursos"])


def _load_temas(db: Session, tema_ids: list[int] | None) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs usando execute como se solicitó."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()


@router.get("/", response_model=CursosResponse)
def get_cursos(
    db: Session = Depends(get_db),
):
    """Obtener todos los cursos con sus relaciones ordenados del más reciente al más antiguo"""
    cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
            joinedload(Cursos.temas),
        )
        .order_by(Cursos.id.desc())  # <-- ORDENAR DESCENDENTE POR ID
        .all()
    )
    return {"cursos": cursos, "total": len(cursos)}


@router.post("/create", response_model=CursosOut)
def create_cursos(
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):

    # Validar y obtener objetos de las relaciones many-to-many
    modulos = (
        db.query(Modulos).filter(Modulos.id.in_(cursos.modulos)).all()
        if cursos.modulos
        else []
    )
    if cursos.modulos and len(modulos) != len(cursos.modulos):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uno o más módulos no encontrados",
        )

    instituciones = (
        db.query(Instituciones).filter(Instituciones.id.in_(cursos.instituciones)).all()
        if cursos.instituciones
        else []
    )
    if cursos.instituciones and len(instituciones) != len(cursos.instituciones):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Una o más instituciones no encontradas",
        )

    perfiles = (
        db.query(Perfiles).filter(Perfiles.id.in_(cursos.perfiles)).all()
        if cursos.perfiles
        else []
    )
    if cursos.perfiles and len(perfiles) != len(cursos.perfiles):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uno o más perfiles no encontrados",
        )

    profesores = (
        db.query(Profesores).filter(Profesores.id.in_(cursos.profesores)).all()
        if cursos.profesores
        else []
    )
    if cursos.profesores and len(profesores) != len(cursos.profesores):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uno o más profesores no encontrados",
        )

    # Generar slug único
    slug = slugify(cursos.titulo)
    base_slug = slug
    contador = 1
    while db.query(Cursos).filter(Cursos.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    db_cursos = Cursos(
        titulo=cursos.titulo,
        descripcion=cursos.descripcion,
        img_portada=cursos.img_portada,
        inicio=cursos.inicio,
        fin=cursos.fin,
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
        clave=cursos.clave,
        archivo=cursos.archivo,
        formulario=cursos.formulario,
        slug=slug,
    )

    db_cursos.modulos = modulos
    db_cursos.instituciones = instituciones
    db_cursos.perfiles = perfiles
    db_cursos.profesores = profesores
    db_cursos.temas = _load_temas(db, cursos.tema_ids)

    db.add(db_cursos)
    db.flush()

    db.commit()
    db.refresh(db_cursos)

    # Recargar con joinedload para serializar correctamente
    db_cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
            joinedload(Cursos.temas),
        )
        .filter(Cursos.id == db_cursos.id)
        .first()
    )
    return db_cursos


@router.get("/slug/{slug}", response_model=CursosOut)
def get_cursos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un curso por slug con sus relaciones"""
    db_cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
            joinedload(Cursos.temas),
        )
        .filter(Cursos.slug == slug)
        .first()
    )
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    return db_cursos


@router.patch("/{curso_id}", response_model=CursosOut)
def update_cursos(
    curso_id: int,
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un curso"""
    db_cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
            joinedload(Cursos.temas),
        )
        .filter(Cursos.id == curso_id)
        .first()
    )
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )

    # Actualizar relaciones many-to-many (solo si se envían en el payload)
    if cursos.modulos is not None:
        modulos = (
            db.query(Modulos).filter(Modulos.id.in_(cursos.modulos)).all()
            if cursos.modulos
            else []
        )
        if len(modulos) != len(cursos.modulos):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uno o más módulos no encontrados",
            )
        db_cursos.modulos = modulos

    if cursos.instituciones is not None:
        instituciones = (
            db.query(Instituciones).filter(Instituciones.id.in_(cursos.instituciones)).all()
            if cursos.instituciones
            else []
        )
        if len(instituciones) != len(cursos.instituciones):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Una o más instituciones no encontradas",
            )
        db_cursos.instituciones = instituciones

    if cursos.perfiles is not None:
        perfiles = (
            db.query(Perfiles).filter(Perfiles.id.in_(cursos.perfiles)).all()
            if cursos.perfiles
            else []
        )
        if len(perfiles) != len(cursos.perfiles):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uno o más perfiles no encontrados",
            )
        db_cursos.perfiles = perfiles

    if cursos.profesores is not None:
        profesores = (
            db.query(Profesores).filter(Profesores.id.in_(cursos.profesores)).all()
            if cursos.profesores
            else []
        )
        if len(profesores) != len(cursos.profesores):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Uno o más profesores no encontrados",
            )
        db_cursos.profesores = profesores

    if cursos.tema_ids is not None:
        db_cursos.temas = _load_temas(db, cursos.tema_ids)

    update_data = dict(cursos)

    if "titulo" in update_data and update_data["titulo"] != db_cursos.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Cursos).filter(Cursos.slug == slug).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data:
            if update_data["slug"]:
                update_data["slug"] = make_unique_slug(
                    db, Cursos, update_data["slug"], exclude_id=db_cursos.id
                )
            else:
                del update_data["slug"]

    campos_escalares = [
        "titulo", "descripcion", "img_portada", "inicio", "fin", "formato", "Horario", "Objetivo",
        "p_ingreso", "p_egreso", "tipo_curso", "inscripcion", "acreditacion",
        "vigencia", "contacto", "destacado", "clave", "archivo", "formulario"
    ]
    for campo in campos_escalares:
        valor = getattr(cursos, campo, None)
        if valor is not None:
            setattr(db_cursos, campo, valor)

    if "slug" in update_data:
        db_cursos.slug = update_data["slug"]

    db.commit()
    db.refresh(db_cursos)

    db_cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
            joinedload(Cursos.temas),
        )
        .filter(Cursos.id == curso_id)
        .first()
    )
    return db_cursos


@router.delete("/{curso_id}", response_model=CursosOut)
def delete_cursos(
    curso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un curso"""
    db_cursos = (
        db.query(Cursos)
        .options(
            joinedload(Cursos.modulos),
            joinedload(Cursos.instituciones),
            joinedload(Cursos.perfiles),
            joinedload(Cursos.profesores),
            joinedload(Cursos.temas),
        )
        .filter(Cursos.id == curso_id)
        .first()
    )
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    db.delete(db_cursos)
    db.commit()
    return db_cursos