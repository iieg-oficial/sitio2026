from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_current_user, get_db, verify_csrf
from app.core.cache import get_cache, redis_client, set_cache
from app.models import Cursos, Usuario, Modulos, Instituciones
from app.schemas.cursos import CursosCreate, CursosOut, CursosResponse

router = APIRouter(prefix="/cursos", tags=["cursos"])

@router.post("/", response_model=CursosOut)
def create_cursos(
    cursos: CursosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    modulos = db.query(Modulos).filter(Modulos.id.in_(cursos.modulo_ids)).all()
    if len(modulos) != len(cursos.modulo_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo no encontrado",
        )
    
    instituciones = db.query(Instituciones).filter(Instituciones.id.in_(cursos.instituciones_ids)).all()
    if len(instituciones) != len(cursos.instituciones_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institución no encontrada",
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
        modulos = db.query(Modulos).filter(Modulos.id.in_(cursos.modulo_ids)).all()
        if len(modulos) != len(cursos.modulo_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Módulo no encontrado",
            )
        db_cursos.modulos = modulos
    
    if cursos.instituciones_ids is not None:
        instituciones = db.query(Instituciones).filter(Instituciones.id.in_(cursos.instituciones_ids)).all()
        if len(instituciones) != len(cursos.instituciones_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institución no encontrada",
            )
        db_cursos.instituciones = instituciones
    
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
    
        
