from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.page import Page

router = APIRouter(tags=["seo"])

DOMAIN = "https://iieg.jalisco.gob.mx"

# Prefijos a excluir estrictamente por segmento exacto
EXCLUDED_PREFIXES = ("/api", "/portal-admin", "/acervo", "/proximamente")
# Rutas exactas a excluir
EXCLUDED_EXACT_PATHS = {"/datos-abiertos"}

RAW_FIXED_PATHS = {
    "/",
    "/mapalab/mapa",
    "/mapalab/",
    "/comunicacion-institucional/",
    "/clasificador-de-cultivos",
    "/landing-sieej",
    "/aviso-de-privacidad",
}


def _clean_slug(slug: str | None) -> str:
    """Limpia y normaliza un slug ignorando fragmentos (#) y queries (?)."""
    if not slug:
        return ""
    
    s = str(slug).strip()
    
    if s.startswith(("http://", "https://")):
        return ""
    
    s = s.split("#", 1)[0].split("?", 1)[0].strip()
    
    if not s or s == "/":
        return ""
        
    s = "/" + s.lstrip("/")
    return s.rstrip("/") if len(s) > 1 else s


def _is_excluded(path: str) -> bool:
    """Verifica si la ruta debe excluirse por prefijo o coincidencia exacta."""
    if path in EXCLUDED_EXACT_PATHS:
        return True
    return any(path == p or path.startswith(p + "/") for p in EXCLUDED_PREFIXES)


@router.api_route("/sitemap.xml", methods=["GET", "HEAD"], response_class=Response)
def generate_sitemap(db: Session = Depends(get_db)):
    """Genera el sitemap XML garantizando coincidencia con las rutas públicas."""
    paths: set[str] = {"/"}

    # 1. Rutas fijas adicionales
    for raw_path in RAW_FIXED_PATHS:
        cleaned = _clean_slug(raw_path)
        if cleaned and not _is_excluded(cleaned):
            paths.add(cleaned)

    # 2. Rutas dinámicas desde la BD (solo activas)
    pages = db.execute(
        select(Page).where(Page.activar.is_(True))
    ).scalars().all()

    for page in pages:
        # Evaluar slug_custom limpio; si es nulo o "#", hacer fallback a page.slug
        custom_clean = _clean_slug(page.slug_custom)
        path = custom_clean if custom_clean else _clean_slug(page.slug)

        if path and not _is_excluded(path):
            paths.add(path)

    # 3. Generar XML
    urls = [f"{DOMAIN}{p}" for p in sorted(paths)]

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    for loc in urls:
        xml_lines.append(f"  <url><loc>{loc}</loc></url>")
    xml_lines.append("</urlset>")

    return Response(
        content="\n".join(xml_lines),
        media_type="application/xml",
        headers={
            "Cache-Control": "public, max-age=3600"
        }
    )