from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Cursos, Usuario, Modulos, Instituciones, Perfiles, Profesores
from app.schemas.cursos import CursosCreate, CursosOut, CursosResponse

router = APIRouter(prefix="/cursos", tags=["cursos"])

@router.post("/create", response_model=CursosOut)
def create_cursos(
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    modulos = db.query(Modulos).filter(Modulos.id.in_(cursos.modulo_ids)).all() if cursos.modulo_ids else []
    if cursos.modulo_ids and len(modulos) != len(cursos.modulo_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo no encontrado",
        )
    
    instituciones = db.query(Instituciones).filter(Instituciones.id.in_(cursos.instituciones_ids)).all() if cursos.instituciones_ids else []
    if cursos.instituciones_ids and len(instituciones) != len(cursos.instituciones_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institución no encontrada",
        )

    perfiles = db.query(Perfiles).filter(Perfiles.id.in_(cursos.perfiles_ids)).all() if cursos.perfiles_ids else []
    if cursos.perfiles_ids and len(perfiles) != len(cursos.perfiles_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado",
        )
    
    profesores = db.query(Profesores).filter(Profesores.id.in_(cursos.profesores_ids)).all() if cursos.profesores_ids else []
    if cursos.profesores_ids and len(profesores) != len(cursos.profesores_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesor no encontrado",
        )

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
        modulos=modulos,
        instituciones=instituciones,
        perfiles=perfiles,
        profesores=profesores,
        inscripcion=cursos.inscripcion,
        acreditacion=cursos.acreditacion,
        vigencia=cursos.vigencia,
        contacto=cursos.contacto,
        destacado=cursos.destacado,
    )
    db.add(db_cursos)
    db.commit()
    db.refresh(db_cursos)
    return db_cursos

@router.get("/", response_model=list[CursosOut])
def get_cursos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtener todos los cursos"""
    cursos = db.query(Cursos).all()
    return cursos

@router.put("/{curso_id}", response_model=CursosOut)
def update_cursos(
    curso_id: int,
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualizar un curso"""
    db_cursos = db.query(Cursos).filter(Cursos.id == curso_id).first()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    
    if cursos.modulo_ids is not None:
        modulos = db.query(Modulos).filter(Modulos.id.in_(cursos.modulo_ids)).all() if cursos.modulo_ids else []
        if len(modulos) != len(cursos.modulo_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Módulo no encontrado",
            )
        db_cursos.modulos = modulos
    
    if cursos.instituciones_ids is not None:
        instituciones = db.query(Instituciones).filter(Instituciones.id.in_(cursos.instituciones_ids)).all() if cursos.instituciones_ids else []
        if len(instituciones) != len(cursos.instituciones_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institución no encontrada",
            )
        db_cursos.instituciones = instituciones

    if cursos.perfiles_ids is not None:
        perfiles = db.query(Perfiles).filter(Perfiles.id.in_(cursos.perfiles_ids)).all() if cursos.perfiles_ids else []
        if len(perfiles) != len(cursos.perfiles_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil no encontrado",
            )
        db_cursos.perfiles = perfiles
    
    if cursos.profesores_ids is not None:
        profesores = db.query(Profesores).filter(Profesores.id.in_(cursos.profesores_ids)).all() if cursos.profesores_ids else []
        if len(profesores) != len(cursos.profesores_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profesor no encontrado",
            )
        db_cursos.profesores = profesores
    
    campos = [
        "titulo", "descripcion", "inicio", "formato", "Horario", "Objetivo", "p_ingreso", "p_egreso", 
        "tipo_curso", "inscripcion", "acreditacion", "vigencia", "contacto", "destacado",
    ]
    for campo in campos:
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
    db_cursos = db.query(Cursos).filter(Cursos.id == curso_id).first()
    if not db_cursos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado",
        )
    db.delete(db_cursos)
    db.commit()
    return db_cursos