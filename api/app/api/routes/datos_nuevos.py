from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import DatosNuevos, Usuario  
from app.models.datos_nuevos import NuevoEnum   
from app.schemas.datos_nuevos import DatosNuevosOut, DatosNuevosResponse, DatosNuevosCreate

router = APIRouter(prefix="/datos-nuevos", tags=["datos-nuevos"])

@router.get("/", response_model=DatosNuevosResponse)
def read_datos_nuevos(
    db: Session = Depends(get_db),
):
    """Obtener todos los datos nuevos"""
    datos_nuevos = db.query(DatosNuevos).all()
    return {
        "datos_nuevos": datos_nuevos,
        "total": len(datos_nuevos),
    }

@router.post("/create", response_model=DatosNuevosCreate)
def create_datos_nuevos(
    datos_nuevos: DatosNuevosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(datos_nuevos.cifras)
    base_slug = slug
    contador = 1
    while db.query(DatosNuevos).filter(DatosNuevos.slug == slug).first():
        slug = slugify(f"{base_slug}-{contador}")
        contador += 1
    
    """Crear un nuevo dato"""
    db_datos_nuevos = DatosNuevos(
        cifras=datos_nuevos.cifras,
        descripcion=datos_nuevos.descripcion,
        slug=slug,
        tipo=datos_nuevos.tipo,
    )
    db.add(db_datos_nuevos)
    db.commit()
    db.refresh(db_datos_nuevos)
    return db_datos_nuevos

@router.patch("/{id}", response_model=DatosNuevosOut)
def update_datos_nuevos(
    id: int,
    datos_nuevos: DatosNuevosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Actualizar un dato"""
    db_datos_nuevos = db.query(DatosNuevos).filter(DatosNuevos.id == id).first()
    if not db_datos_nuevos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dato no encontrado",
        )
    
    update_data = datos_nuevos.dict(exclude_unset=True)

    if "cifras" in update_data and update_data["cifras"] != db_datos_nuevos.cifras:
        slug = slugify(str(update_data["cifras"]))
        base_slug = slug
        contador = 1
        while db.query(DatosNuevos).filter(DatosNuevos.slug == slug).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    
    for campo, valor in update_data.items():
        setattr(db_datos_nuevos, campo, valor)
    
    db.commit()
    db.refresh(db_datos_nuevos)
    return db_datos_nuevos

@router.delete("/{id}", response_model=DatosNuevosOut)
def delete_datos_nuevos(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    """Eliminar un dato"""
    db_datos_nuevos = db.query(DatosNuevos).filter(DatosNuevos.id == id).first()
    if not db_datos_nuevos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dato no encontrado",
        )
    db.delete(db_datos_nuevos)
    db.commit()
    return db_datos_nuevos


@router.get("/tipo")
def get_tipos(
):
    return {
        "tipos": {
            tipo.name: tipo.value for tipo in NuevoEnum
        }
    }

@router.get("/slug/{slug}", response_model=DatosNuevosOut)
def get_datos_nuevos_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un dato nuevo por slug"""
    datos_nuevos = db.query(DatosNuevos).filter(DatosNuevos.slug == slug).first()
    if not datos_nuevos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dato nuevo no encontrado"
        )
    return datos_nuevos