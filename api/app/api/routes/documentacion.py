from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Documentacion, Usuario
from app.schemas import DocumentacionCreate, DocumentacionOut, DocumentacionResponse, DocumentacionList

router = APIRouter(prefix="/documentacion", tags=["documentacion"])

@router.get("", response_model=DocumentacionList)
async def listar_documentaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentaciones = db.query(Documentacion).options(joinedload(Documentacion.subject)).all()
    return {
        "documentaciones": documentaciones,
        "total": len(documentaciones),
    }

@router.post("/create", response_model=DocumentacionOut, status_code=status.HTTP_201_CREATED)
async def crear_documentacion(
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    slug = slugify(documentacion_in.titulo)
    base_slug = slug
    contador = 1
    while db.query(Documentacion).filter(Documentacion.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    nuevo = Documentacion(
        titulo=documentacion_in.titulo,
        descripcion=documentacion_in.descripcion,
        metodologia=documentacion_in.metodologia,
        codigo=documentacion_in.codigo,
        claves=documentacion_in.claves,
        subject_id=documentacion_in.subject_id,
        slug=slug,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return db.query(Documentacion).options(joinedload(Documentacion.subject)).filter(Documentacion.id == nuevo.id).first()

@router.get("/{documentacion_id}", response_model=DocumentacionResponse)
async def obtener_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentacion = db.query(Documentacion).options(joinedload(Documentacion.subject)).filter(Documentacion.id == documentacion_id).first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion

@router.put("/{documentacion_id}", response_model=DocumentacionOut)
async def actualizar_documentacion(
    documentacion_id: int,
    documentacion_in: DocumentacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentacion = db.query(Documentacion).filter(Documentacion.id == documentacion_id).first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )

    update_data = documentacion_in.dict(exclude_unset=True)
    if "titulo" in update_data and update_data["titulo"] != documentacion.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Documentacion).filter(Documentacion.slug == slug).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug

    for campo, valor in update_data.items():
        setattr(documentacion, campo, valor)

    db.commit()
    db.refresh(documentacion)
    return db.query(Documentacion).options(joinedload(Documentacion.subject)).filter(Documentacion.id == documentacion.id).first()

@router.delete("/{documentacion_id}")
async def eliminar_documentacion(
    documentacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documentacion = db.query(Documentacion).filter(Documentacion.id == documentacion_id).first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    db.delete(documentacion)
    db.commit()
    return documentacion

@router.get("/slug/{slug}", response_model=DocumentacionOut)
def get_documentacion_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una documentación por slug"""
    documentacion = db.query(Documentacion).filter(Documentacion.slug == slug).first()
    if not documentacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documentación no encontrada"
        )
    return documentacion