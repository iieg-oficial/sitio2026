from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.page import Page

router = APIRouter(tags=["seo"])

DOMAIN = "https://iieg.jalisco.gob.mx"


def _clean_slug(slug: str | None) -> str:
    """Normaliza el slug para asegurar un formato de ruta correcto."""
    if not slug:
        return ""
    slug_str = str(slug).strip()
    if slug_str.startswith(("http://", "https://")):
        return slug_str
    return f"/{slug_str.lstrip('/')}"


@router.get("/sitemap.xml", response_class=Response(media_type="application/xml"))
def generate_sitemap(db: Session = Depends(get_db)):
    """
    Genera un sitemap.xml dinámico basado en las páginas activas de la BD.
    Incluye subpáginas y conserva rutas de Mapalab si siguen vigentes.
    """
    # 1. URLs estáticas o externas a la BD (Mapalab, etc.)
    urls: set[str] = {
        f"{DOMAIN}/",
        f"{DOMAIN}/mapalab/",
        f"{DOMAIN}/mapalab/mapa",
    }

    # 2. Consultar páginas de la BD que estén activas
    pages = db.execute(
        select(Page).where(Page.activar.is_(True))
    ).scalars().all()

    for page in pages:
        # Usar slug_custom o slug según disponibilidad en tu modelo
        page_slug = getattr(page, "slug_custom", None) or page.slug
        clean_path = _clean_slug(page_slug)

        # Omitir rutas de borrador, desarrollo o inicio (ya incluida arriba)
        if clean_path and clean_path not in ["/", "/proximamente"]:
            if clean_path.startswith("http"):
                # Si es un enlace externo completo, se omite del sitemap
                continue
            urls.add(f"{DOMAIN}{clean_path}")

    # 3. Construir respuesta XML
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    for loc in sorted(urls):
        xml_lines.append(f"  <url><loc>{loc}</loc></url>")
        
    xml_lines.append("</urlset>")

    return Response(
    content="\n".join(xml_lines),
    media_type="application/xml",
    headers={
        # Indica a los proxies/CDN que guarden en caché por 1 hora
        "Cache-Control": "public, max-age=3600"
    }
)