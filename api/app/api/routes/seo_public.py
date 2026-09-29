from fastapi import APIRouter, Query, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
import logging

from app.core.database import get_db
from app.models.page import Page
from app.models.cursos import Cursos
from app.models.flashes import Flashes
from app.models.mapa import Mapa
from app.models.posts import Posts, GalleryImage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seo-preview", tags=["seo-public"])

@router.get("", response_class=HTMLResponse)
def seo_preview(
    path: str = Query("/", description="Ruta enviada por Nginx"),
    db: Session = Depends(get_db)
):
    segments = [s for s in path.strip("/").split("/") if s]

    # Valores por defecto (Fallback)
    seo_title = "Inicio - IIEG"
    seo_desc = "Consulta información estadística y geográfica de Jalisco..."
    seo_image = "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"
    seo_keywords = "estadistica, jalisco, iieg"

    try:
        # --- CASO 1: Ruta de 1 nivel (ej. /preguntas-frecuentes o /nuestros-productos) ---
        if len(segments) == 1:
            slug = segments[0]
            stmt = select(Page).where((Page.slug == slug) | (Page.slug == f"/{slug}"))
            pages = db.execute(stmt).scalars().first()

            if pages:
                seo_title = getattr(pages, "title", None) or getattr(pages, "titulo", None) or seo_title
                seo_desc = getattr(pages, "description_meta", None) or getattr(pages, "descripcion", None) or getattr(pages, "content", None) or seo_desc
                seo_keywords = getattr(pages, "keywords_meta", None) or getattr(pages, "keywords", None) or getattr(pages, "claves", None) or seo_keywords
                seo_image = getattr(pages, "image", None) or getattr(pages, "imagen", None) or seo_image
            else:
                logger.warning(f"No se encontró registro en 'Page' para slug='{slug}'")

        # --- CASO 2: Ruta de 2 niveles ---
        elif len(segments) >= 2:
            tipo_contenido, item_slug = segments[0], segments[1]

            if tipo_contenido in ["educacion-continua", "convocatorias"]:
                stmt = select(Cursos).where((Cursos.slug == item_slug) | (Cursos.slug == f"/{item_slug}"))
                item = db.execute(stmt).scalars().first()
                if item:
                    seo_title = f"{getattr(item, 'titulo', 'Curso')} - IIEG"
                    seo_desc = getattr(item, "descripcion", None) or getattr(item, "resumen", None) or seo_desc
                    seo_image = getattr(item, "img_portada", None) or getattr(item, "imagen", None) or seo_image

            elif tipo_contenido == "datos-expres":
                stmt = select(Flashes).where((Flashes.slug == item_slug) | (Flashes.slug == f"/{item_slug}"))
                item = db.execute(stmt).scalars().first()
                if item:
                    seo_title = f"{getattr(item, 'titulo', 'Flash')} - IIEG"
                    seo_desc = getattr(item, "desc_jal", None) or getattr(item, "resumen", None) or seo_desc
                    seo_keywords = getattr(item, "claves", None) or seo_keywords

            elif tipo_contenido == "comunicacion-institucional":
                stmt = select(Posts).where((Posts.slug == item_slug) | (Posts.slug == f"/{item_slug}")).options(selectinload(Posts.gallery_images))
                item = db.execute(stmt).scalars().first()

                if item:
                    seo_title = f"{getattr(item, 'titulo', 'Post')} - IIEG"
                    seo_desc = getattr(item, "resumen", None) or seo_desc
                    seo_keywords = getattr(item, "claves", None) or seo_keywords

                    if item.gallery_images and len(item.gallery_images) > 0:
                        seo_image = item.gallery_images[0].url

            elif tipo_contenido == "galeria-de-mapas":
                stmt = select(Mapa).where((Mapa.slug == item_slug) | (Mapa.slug == f"/{item_slug}"))
                item = db.execute(stmt).scalars().first()
                if item:
                    seo_title = f"{getattr(item, 'titulo', 'Mapa')} - IIEG"
                    seo_desc = getattr(item, "informacion", None) or getattr(item, "resumen", None) or seo_desc
                    seo_image = getattr(item, "imagen", None) or seo_image

    except Exception as e:
        logger.error(f"Error procesando metadata SEO para la ruta '{path}': {e}", exc_info=True)

    # Sanitizar valores
    seo_title = seo_title or "IIEG Jalisco"
    seo_desc = seo_desc or "Instituto de Información Estadística y Geográfica de Jalisco"
    seo_image = seo_image or "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"

    # Convertir a URL absoluta si es relativa
    if seo_image and not seo_image.startswith("http"):
        base_domain = "https://iieg.jalisco.gob.mx"
        seo_image = f"{base_domain}/{seo_image.lstrip('/')}"

    html_content = f"""<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>{seo_title}</title>
    <meta name="description" content="{seo_desc}" />
    <meta name="keywords" content="{seo_keywords}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{seo_title}" />
    <meta property="og:description" content="{seo_desc}" />
    <meta property="og:image" content="{seo_image}" />
    <meta property="og:image:secure_url" content="{seo_image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="https://iieg.jalisco.gob.mx{path}" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{seo_title}" />
    <meta name="twitter:description" content="{seo_desc}" />
    <meta name="twitter:image" content="{seo_image}" />
</head>
<body></body>
</html>"""

    return HTMLResponse(content=html_content, status_code=200)