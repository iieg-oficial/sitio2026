from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.page import Page

router = APIRouter(tags=["seo"])

DOMAIN = "https://iieg.jalisco.gob.mx"

FIXED_PATHS = [
    "/",
    "/comunicacion-institucional",
    "/clasificador-de-cultivos",
    "/landing-sieej",
    "/aviso-de-privacidad",
]

EXTRA_PATHS = ["/mapalab/", "/mapalab/mapa"]

EXCLUDED_PREFIXES = ("/datos-abiertos", "/api", "/portal-admin", "/acervo", "/proximamente")


def _clean_slug(slug: str | None) -> str:
    if not slug:
        return ""
    s = str(slug).strip()
    if s.startswith(("http://", "https://")):
        return ""  # enlaces externos: fuera del sitemap
    s = s.split("#", 1)[0].split("?", 1)[0]  # sin ancla ni query
    s = "/" + s.lstrip("/")
    return s.rstrip("/") if len(s) > 1 else s


def _is_excluded(path: str) -> bool:
    return any(path == p or path.startswith(p + "/") for p in EXCLUDED_PREFIXES)


@router.api_route("/sitemap.xml", methods=["GET", "HEAD"], response_class=Response)
def generate_sitemap(db: Session = Depends(get_db)):
    paths: set[str] = set(FIXED_PATHS) | set(EXTRA_PATHS)

    pages = db.execute(select(Page).where(Page.activar.is_(True))).scalars().all()
    for page in pages:
        path = _clean_slug(getattr(page, "slug_custom", None) or page.slug)
        if path and not _is_excluded(path):
            paths.add(path)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    lines += [f"  <url><loc>{escape(DOMAIN + p)}</loc></url>" for p in sorted(paths)]
    lines.append("</urlset>")

    return Response(
        content="\n".join(lines),
        media_type="application/xml",
        headers={"Cache-Control": "public, max-age=3600"},
    )