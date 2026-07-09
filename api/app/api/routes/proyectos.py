from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from app.api.deps import get_db, get_current_user, verify_csrf
from app.models import Proyectos, Usuario
from app.schemas.proyectos import ProyectosCreate, ProyectosOut, ProyectosResponse

router = APIRouter(prefix="/proyectos", tags=["proyectos"]) 

@router.get("", response_model=ProyectosResponse)
async def listar_proyectos(
    db: Session = Depends(get_db), 
):
    proyectos = db.query(Proyectos).all()
    return {
        "proyectos": proyectos,
        "total": len(proyectos),
    }   

@router.get("/{proyecto_id}", response_model=ProyectosOut)
async def obtener_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
):
    proyecto = db.query(Proyectos).filter(Proyectos.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )
    return proyecto

@router.post("/create", response_model=ProyectosOut, status_code=status.HTTP_201_CREATED)
async def crear_proyecto(   
    proyecto_in: ProyectosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf)
):
    slug = slugify(proyecto_in.nombre)
    base_slug = slug
    contador = 1
    while db.query(Proyectos).filter(Proyectos.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    nuevo = Proyectos(
        nombre=proyecto_in.nombre,
        descripcion=proyecto_in.descripcion,
        slug=slug,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.patch("/{proyecto_id}", response_model=ProyectosOut)
async def actualizar_proyecto(
    proyecto_id: int,
    proyecto_in: ProyectosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf)
):
    proyecto = db.query(Proyectos).filter(Proyectos.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )
    
    slug = slugify(proyecto_in.nombre)
    base_slug = slug
    contador = 1
    while db.query(Proyectos).filter(Proyectos.slug == slug, Proyectos.id != proyecto_id).first():
        slug = f"{base_slug}-{contador}"
        contador += 1

    proyecto.nombre = proyecto_in.nombre
    proyecto.descripcion = proyecto_in.descripcion
    proyecto.slug = slug

    db.commit()
    db.refresh(proyecto)
    return proyecto

@router.delete("/{proyecto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf)
):
    proyecto = db.query(Proyectos).filter(Proyectos.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )
    
    db.delete(proyecto)
    db.commit()
    return {"message": "Proyecto eliminado exitosamente"}

@router.get("/slug/{slug}", response_model=ProyectosOut)
def get_proyecto_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Obtener un proyecto por slug"""
    proyecto = db.query(Proyectos).filter(Proyectos.slug == slug).first()
    if not proyecto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado"
        )
    return proyecto