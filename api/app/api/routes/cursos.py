from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Cursos, Usuario
from app.schemas.cursos import CursosCreate, CursosOut, CursosResponse

router = APIRouter(prefix="/cursos", tags=["cursos"])

@router.get("/", response_model=CursosResponse)
def read_cursos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los cursos"""
    cursos = db.query(Cursos).options(joinedload(Cursos.profesor), joinedload(Cursos.modulo), joinedload(Cursos.perfil), joinedload(Cursos.institucion)).all()
    return {
        "cursos": cursos,
        "total": len(cursos),
    }

@router.post("/create", response_model=CursosOut)
def create_cursos(
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crear un nuevo curso"""
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
        profesores_id=cursos.profesores_id,
        modulo_id=cursos.modulo_id,
        inscripcion=cursos.inscripcion,
        acreditacion=cursos.acreditacion,
        perfiles_id=cursos.perfiles_id,
        institucion_id=cursos.institucion_id,
        vigencia=cursos.vigencia,
        contacto=cursos.contacto,
        destacado=cursos.destacado,
    )
    db.add(db_cursos)
    db.commit()
    db.refresh(db_cursos)
    return db.query(Cursos).options(joinedload(Cursos.profesor), joinedload(Cursos.modulo), joinedload(Cursos.perfil), joinedload(Cursos.institucion)).filter(Cursos.id == db_cursos.id).first()

@router.put("/{id}", response_model=CursosOut)
def update_cursos(
    id: int,
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un curso"""
    db_cursos = db.query(Cursos).options(joinedload(Cursos.profesor), joinedload(Cursos.modulo), joinedload(Cursos.perfil), joinedload(Cursos.institucion)).filter(Cursos.id == id).first()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    db_cursos.titulo = cursos.titulo
    db_cursos.descripcion = cursos.descripcion
    db_cursos.inicio = cursos.inicio
    db_cursos.formato = cursos.formato
    db_cursos.Horario = cursos.Horario
    db_cursos.Objetivo = cursos.Objetivo
    db_cursos.p_ingreso = cursos.p_ingreso
    db_cursos.p_egreso = cursos.p_egreso
    db_cursos.tipo_curso = cursos.tipo_curso
    db_cursos.profesores_id = cursos.profesores_id
    db_cursos.modulo_id = cursos.modulo_id
    db_cursos.inscripcion = cursos.inscripcion
    db_cursos.acreditacion = cursos.acreditacion
    db_cursos.perfiles_id = cursos.perfiles_id
    db_cursos.institucion_id = cursos.institucion_id
    db_cursos.vigencia = cursos.vigencia
    db_cursos.contacto = cursos.contacto
    db_cursos.destacado = cursos.destacado
    db.commit()
    db.refresh(db_cursos)
    return db.query(Cursos).options(joinedload(Cursos.profesor), joinedload(Cursos.modulo), joinedload(Cursos.perfil), joinedload(Cursos.institucion)).filter(Cursos.id == db_cursos.id).first()

@router.delete("/{id}", response_model=CursosOut)
def delete_cursos(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminar un curso"""
    db_cursos = db.query(Cursos).filter(Cursos.id == id).first()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    db.delete(db_cursos)
    db.commit()
    return {"message": "Curso eliminado exitosamente"}