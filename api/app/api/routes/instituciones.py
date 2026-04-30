from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models.instituciones import Instituciones
from app.schemas.instituciones import InstitucionesCreate, InstitucionesOut, InstitucionesResponse

router = APIRouter(prefix="/instituciones", tags=["instituciones"])

@router.get("", response_model=InstitucionesResponse)
async def listar_instituciones(
    db: Session = Depends(get_db)
    ):
    instituciones = db.query(Instituciones).all()
    return {"instituciones": instituciones, "total": len(instituciones)}

@router.get("/{institucion_id}", response_model=InstitucionesOut)
async def obtener_institucion(
    institucion_id: int, 
    db: Session = Depends(get_db)
    ):
    institucion = db.query(Instituciones).filter(Instituciones.id == institucion_id).first()
    if not institucion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institucion no encontrada"
        )
    return institucion

@router.post("/create", response_model=InstitucionesOut, status_code=status.HTTP_201_CREATED)
async def crear_institucion(
    institucion_in: InstitucionesCreate,
    db: Session = Depends(get_db),
):
    slug = slugify(institucion_in.nombre)
    base_slug = slug
    contador = 1
    while db.query(Instituciones).filter(Instituciones.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    nuevo = Instituciones(
        nombre=institucion_in.nombre,
        descripcion=institucion_in.descripcion,
        logo=institucion_in.logo,
        slug=slug,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{institucion_id}", response_model=InstitucionesOut)
async def actualizar_institucion(
    institucion_id: int,
    institucion_in: InstitucionesCreate,
    db: Session = Depends(get_db),
):
    institucion = db.query(Instituciones).filter(Instituciones.id == institucion_id).first()
    if not institucion:
        raise HTTPException(status_code=404, detail="Institucion no encontrada")

    update_data = institucion_in.model_dump(exclude_unset=True)

    if "nombre" in update_data and update_data["nombre"] != institucion.nombre:
        slug = slugify(update_data["nombre"])
        base_slug = slug
        contador = 1
        while db.query(Instituciones).filter(Instituciones.slug == slug, Instituciones.id != institucion_id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]

    for campo, valor in update_data.items():
        setattr(institucion, campo, valor)
    
    db.commit()
    db.refresh(institucion)
    return institucion

@router.delete("/{institucion_id}")
async def eliminar_institucion(
    institucion_id: int,
    db: Session = Depends(get_db),
):
    institucion = db.query(Instituciones).filter(Instituciones.id == institucion_id).first()
    if not institucion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institucion no encontrada"
        )
    db.delete(institucion)
    db.commit()
    return {"message": "Institucion eliminada exitosamente"}

@router.get("/slug/{slug}", response_model=InstitucionesOut)
def get_instituciones_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener una institucion por slug"""
    institucion = db.query(Instituciones).filter(Instituciones.slug == slug).first()
    if not institucion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Institucion no encontrada"
        )
    return institucion