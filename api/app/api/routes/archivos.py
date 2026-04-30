from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from slugify import slugify
from app.api.deps import get_current_user, get_db, verify_csrf
from app.models import Archivos, Usuario
from app.schemas.archivo import ArchivoCreate, ArchivoOut, ArchivoResponse, ArchivoList 

router = APIRouter(prefix="/archivos", tags=["archivos"])

@router.get("", response_model=ArchivoList)
async def listar_archivos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    archivos = db.query(Archivos).options(joinedload(Archivos.subject)).all()
    return {
        "archivos": archivos,
        "total": len(archivos),
    }


@router.post("/create", response_model=ArchivoOut, status_code=status.HTTP_201_CREATED)
async def crear_archivo(
    archivo_in: ArchivoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    slug = slugify(archivo_in.titulo)
    base_slug = slug
    contador = 1
    while db.query(Archivos).filter(Archivos.slug == slug).first():
        slug = f"{base_slug}-{contador}"
        contador += 1
    
    nuevo = Archivos(
        titulo=archivo_in.titulo,
        fecha=archivo_in.fecha,
        tipo=archivo_in.tipo,
        subject_id=archivo_in.subject_id,
        periocidad=archivo_in.periocidad,
        archivo=archivo_in.archivo,
        slug=slug,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return db.query(Archivos).options(joinedload(Archivos.subject)).filter(Archivos.id == nuevo.id).first()

@router.get("/{archivo_id}", response_model=ArchivoResponse)
async def obtener_archivo(
    archivo_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    archivo = db.query(Archivos).options(joinedload(Archivos.subject)).filter(Archivos.id == archivo_id).first()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    return archivo

@router.put("/{archivo_id}", response_model=ArchivoOut)
async def actualizar_archivo(
    archivo_id: int,
    archivo_in: ArchivoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    archivo = db.query(Archivos).filter(Archivos.id == archivo_id).first()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    update_data = archivo_in.model_dump(exclude_unset=True)
    
    if "titulo" in update_data and update_data["titulo"] != archivo.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Archivos).filter(Archivos.slug == slug, Archivos.id != archivo_id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and not update_data["slug"]:
        del update_data["slug"]
    
    for campo, valor in update_data.items():
        setattr(archivo, campo, valor)

    db.commit()
    db.refresh(archivo)
    return db.query(Archivos).options(joinedload(Archivos.subject)).filter(Archivos.id == archivo_id).first()

@router.delete("/{archivo_id}")
async def eliminar_archivo(
    archivo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    archivo = db.query(Archivos).filter(Archivos.id == archivo_id).first()
    if not archivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
        )
    db.delete(archivo)
    db.commit()
    return {"message": "Archivo eliminado exitosamente"}
