from fastapi import APIRouter, Depends, HTTPException, Query, status
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.api.deps import get_db, verify_csrf
from app.core.search import escape_like
from app.models import Servicios, Usuario
from app.models.servicios import TipoServicioEnum
from app.schemas import ServiciosCreate, ServiciosOut, ServiciosResponse

router = APIRouter(prefix="/servicios", tags=["servicios"])

@router.get("", response_model=ServiciosResponse)
def listar_servicios(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
    db: Session = Depends(get_db),
):
    query = select(Servicios)

    if search:
        like = f"%{escape_like(search)}%"
        query = query.where(
            Servicios.titulo.ilike(like, escape='\\')
        )

    total = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    # La consulta SQL ya realiza el offset y limit de forma eficiente
    servicios_list = db.execute(
        query.order_by(Servicios.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).scalars().all()

    # Retornar directamente los registros paginados desde la BD
    return ServiciosResponse(servicios=servicios_list, total=total)

# Definir la ruta antes de /{slug} para evitar colisiones
@router.get("/tipos-servicio")
def get_tipos_servicio():
    return {
        "tipos_servicio": [
            {"id": tipo.name, "nombre": tipo.value} for tipo in TipoServicioEnum
        ]
    }

@router.post("", response_model=ServiciosOut, status_code=status.HTTP_201_CREATED)
def crear_servicio(
    servicio: ServiciosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    slug = slugify(servicio.titulo)
    base_slug = slug
    counter = 1
    while db.query(Servicios).filter(Servicios.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    nuevo_servicio = Servicios(
        codigo=servicio.codigo,
        tipo=servicio.tipo,
        titulo=servicio.titulo,
        formato_entrega=servicio.formato_entrega,
        descripcion=servicio.descripcion,
        unidad_medida=servicio.unidad_medida,
        costos=servicio.costos,
        politicas=servicio.politicas,
        slug=slug
    )
    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)
    return nuevo_servicio


@router.put("/{servicio_id}", response_model=ServiciosOut)
@router.patch("/{servicio_id}", response_model=ServiciosOut)
def actualizar_servicio(
    servicio_id: int,
    servicio: ServiciosCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    db_servicio = db.query(Servicios).filter(Servicios.id == servicio_id).first()
    if not db_servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    update_data = servicio.model_dump(exclude_unset=True)

    if "titulo" in update_data and update_data["titulo"] != db_servicio.titulo:
        slug = slugify(update_data["titulo"])
        base_slug = slug
        contador = 1
        while db.query(Servicios).filter(Servicios.slug == slug, Servicios.id != servicio_id).first():
            slug = f"{base_slug}-{contador}"
            contador += 1
        update_data["slug"] = slug
    elif "slug" in update_data and update_data["slug"]:
        del update_data["slug"]

    for key, value in update_data.items():
        setattr(db_servicio, key, value)

    db.commit()
    db.refresh(db_servicio)
    return db_servicio

@router.delete("/{servicio_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_servicio(
    servicio_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    db_servicio = db.query(Servicios).filter(Servicios.id == servicio_id).first()
    if not db_servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    db.delete(db_servicio)
    db.commit()

@router.get("/{slug}", response_model=ServiciosOut)
def obtener_servicio_por_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    servicio = db.query(Servicios).filter(Servicios.slug == slug).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio