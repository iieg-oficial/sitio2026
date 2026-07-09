from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Documentacion, Usuario, Subject, Proyectos
from app.models.documentacion import TipoEnum
from app.schemas import DocumentacionCreate, DocumentacionOut, DocumentacionResponse, DocumentacionList

router = APIRouter(prefix="/documentacion", tags=["documentacion"])

def _load_temas(db: Session, tema_ids: list[int]) -> list[Subject]:
    """Carga los objetos Subject dado una lista de IDs, ignorando IDs inválidos."""
    if not tema_ids:
        return []
    return db.execute(
        select(Subject).where(Subject.id.in_(tema_ids))
    ).scalars().all()

def _load_proyectos(db: Session, proyecto_ids: list[int]) -> list[Proyectos]:
    """Carga los objetos Proyectos dado una lista de IDs, ignorando IDs inválidos."""
    if not proyecto_ids:
        return []
    return db.execute(
        select(Proyectos).where(Proyectos.id.in_(proyecto_ids))
    ).scalars().all()

@router.get("", response_model=DocumentacionList)
async def listar_documentaciones(
    db: Session = Depends(get_db),
):
    documentaciones = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas), 
            joinedload(Documentacion.proyectos)
        )
        .all()
    )
    return {"documentaciones": documentaciones, "total": len(documentaciones)}

@router.post("/create", response_model=DocumentacionOut, status_code=status.HTTP_201_CREATED)
async def crear_documentacion(
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    proyectos = (
        db.query(Proyectos).filter(Proyectos.id.in_(documentacion_in.proyectos)).all()
        if documentacion_in.proyectos 
        else []
    )
    if documentacion_in.proyectos and len(proyectos) != len(documentacion_in.proyectos):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uno o más proyectos proporcionados no existen.",
        )
    
    slug = slugify(documentacion_in.titulo)
    base_slug = slug
    contador = 1
    while db.execute(
        select(Documentacion).where(Documentacion.slug == slug)
    ).scalars().first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    nuevo = Documentacion(
        titulo=documentacion_in.titulo,
        descripcion=documentacion_in.descripcion,
        anyo=documentacion_in.anyo,
        archivo=documentacion_in.archivo,
        tipo=documentacion_in.tipo,
        claves=documentacion_in.claves,
        slug=slug,
    )

    nuevo.proyectos = proyectos
    nuevo.temas = _load_temas(db, documentacion_in.tema_ids or [])
    
    db.add(nuevo)
    db.flush()

    db.commit()
    db.refresh(nuevo)

    nuevo = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.proyectos)
        )
        .filter(Documentacion.id == nuevo.id)
        .first()
    )
    return nuevo

@router.get("/tipos")
def get_tipos():
    return {
        "tipos":{
            tipo.name: tipo.value for tipo in TipoEnum
        }
    }

@router.get("/slug/{slug}", response_model=DocumentacionOut)
def get_documentacion_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    documentacion = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.proyectos)
        )
        .filter(Documentacion.slug == slug)
        .first()
    )
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion

@router.get("/{documentacion_id}", response_model=DocumentacionResponse)
async def obtener_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
):
    documentacion = db.get(Documentacion, documentacion_id)
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion

@router.patch("/{documentacion_id}", response_model=DocumentacionOut)
async def actualizar_documentacion(
    documentacion_id: int,
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    documentacion = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.proyectos),
        )
        .filter(Documentacion.id == documentacion_id)
        .first()
    )
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    
    if documentacion_in.proyectos is not None:
        proyectos = (
            db.query(Proyectos).filter(Proyectos.id.in_(documentacion_in.proyectos)).all()
            if documentacion_in.proyectos else []
        )
        if len(proyectos) != len(documentacion_in.proyectos):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uno o más proyectos proporcionados no existen.",
            )
        documentacion.proyectos = proyectos

    update_data = dict(documentacion_in)

    if "titulo" in update_data and update_data["titulo"] != documentacion.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.execute(
            select(Documentacion).where(Documentacion.slug == slug)
        ).scalars().first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    campos = [
        "nombre", "descripcion", "anyo", "archivo", "tipo", "claves"
    ]

    for campo in campos:
        valor = getattr(documentacion_in, campo, None)
        if valor is not None:
            setattr(documentacion, campo, valor)
        

    db.commit()
    db.refresh(documentacion)

    documentacion = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.proyectos)
        )
        .filter(Documentacion.id == documentacion_id)
        .first()
    )
    
    return documentacion

@router.delete("/{documentacion_id}")
async def eliminar_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    documentacion = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.proyectos)
        )
        .filter(Documentacion.id == documentacion_id)
        .first()
    )
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    db.delete(documentacion)
    db.commit()
    return documentacion

