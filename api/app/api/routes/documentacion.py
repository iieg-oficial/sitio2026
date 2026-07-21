from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Documentacion, Usuario, Subject, Sistemas
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

def _load_sistemas(db: Session, sistema_ids: list[int]) -> list[Sistemas]:
    """Carga los objetos sistemas dado una lista de IDs, ignorando IDs inválidos."""
    if not sistema_ids:
        return []
    return db.execute(
        select(Sistemas).where(Sistemas.id.in_(sistema_ids))
    ).scalars().all()

@router.get("", response_model=DocumentacionList)
async def listar_documentaciones(
    db: Session = Depends(get_db),
):
    documentaciones = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas), 
            joinedload(Documentacion.sistemas)
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

    nuevo.sistemas = _load_sistemas(db, documentacion_in.sistema_ids or [])
    nuevo.temas = _load_temas(db, documentacion_in.tema_ids or [])
    
    db.add(nuevo)
    db.flush()

    db.commit()
    db.refresh(nuevo)

    nuevo = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.sistemas)
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
            joinedload(Documentacion.sistemas)
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
            joinedload(Documentacion.sistemas),
        )
        .filter(Documentacion.id == documentacion_id)
        .first()
    )
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    
    update_data = dict(documentacion_in)

    if "titulo" in update_data and update_data["titulo"] and update_data["titulo"] != documentacion.titulo:
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

    # Actualizar relacion many-to-many de sistemas
    if "sistema_ids" in update_data:
        documentacion.sistemas = _load_sistemas(db, update_data.pop("sistema_ids") or [])
    else:
        update_data.pop("sistema_ids", None)

    # Actualizar relacion many-to-many de temas
    if "tema_ids" in update_data:
        documentacion.temas = _load_temas(db, update_data.pop("tema_ids") or [])
    else:
        update_data.pop("tema_ids", None)

    campos = [
        "titulo", "descripcion", "anyo", "archivo", "tipo", "claves"
    ]

    for campo in campos:
        valor = update_data.get(campo)
        if valor is not None:
            setattr(documentacion, campo, valor)

    if "slug" in update_data:
        documentacion.slug = update_data["slug"]
        

    db.commit()
    db.refresh(documentacion)

    documentacion = (
        db.query(Documentacion)
        .options(
            joinedload(Documentacion.temas),
            joinedload(Documentacion.sistemas)
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
            joinedload(Documentacion.sistemas)
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

