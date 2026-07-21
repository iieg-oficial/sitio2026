import inspect
import logging

import app.models as model_registry
from fastapi import APIRouter, Depends, Query
from sqlalchemy import String, cast, or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.search import SearchResponse

router = APIRouter(prefix="/search", tags=["portal - search"])
logger = logging.getLogger(__name__)


ROUTE_PREFIX_BY_MODEL = {
    "Archivos": "/archivos/slug",
    "Banner": "/banner",
    "Cursos": "/cursos/slug",
    "DatosNuevos": "/datos-nuevos/slug",
    "Directorio": "/directorio/slug",
    "DocsIIEG": "/docs-iieg/slug",
    "Documentacion": "/documentacion/slug",
    "Flashes": "/flashes/slug",
    "Instituciones": "/instituciones/slug",
    "Mapa": "/mapa/slug",
    "Modulos": "/modulos/slug",
    "Organos": "/organos/slug",
    "Perfiles": "/perfiles/slug",
    "Posts": "/comunidad",
    "Preguntas": "/preguntas/slug",
    "Profesores": "/profesores/slug",
    "Reportes": "/reportes/slug",
    "Sistemas": "/sistemas/slug",
    "Snieg": "/snieg/slug",
    "Subject": "/subject/slug",
}

TYPE_LABEL_BY_MODEL = {
    "Posts": "Comunidad",
    "Page": "Pagina",
}

EXCLUDED_COLUMNS = {
    "hashed_password",
    "data",
    "metadata",
    "metadata_json",
}

EXCLUDED_MODELS = {
    "Media",
    "MediaFolder",
    "Usuario",
}


def _normalize_text(value) -> str:
    return _stringify(value).strip().lower()


def _compute_relevance(model_name: str, row, query: str, title: str, description: str) -> int:
    q = _normalize_text(query)
    title_text = _normalize_text(title)
    desc_text = _normalize_text(description)
    slug_text = _normalize_text(getattr(row, "slug", ""))

    score = 0

    if title_text == q:
        score += 120
    elif title_text.startswith(q):
        score += 85
    elif q in title_text:
        score += 65

    if slug_text == q:
        score += 70
    elif slug_text.startswith(q):
        score += 45
    elif q in slug_text:
        score += 30

    if desc_text.startswith(q):
        score += 25
    elif q in desc_text:
        score += 15

    # Small bonuses for records that are usually stronger intent matches.
    if model_name in {"Posts", "Page"}:
        score += 5

    return score


def _external_url(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")


def _page_url(page) -> str:
    if not page.link_interno and page.slug_custom:
        return page.slug_custom

    if page.slug_custom:
        return page.slug_custom if page.slug_custom.startswith("/") else f"/{page.slug_custom}"

    if page.slug:
        return f"/{page.slug}"

    return "/"


def _iter_search_models():
    for _, klass in inspect.getmembers(model_registry, inspect.isclass):
        if klass.__name__ == "Base":
            continue
        if klass.__name__ in EXCLUDED_MODELS:
            continue
        if not hasattr(klass, "__table__"):
            continue
        if not getattr(klass, "__tablename__", None):
            continue
        yield klass


def _stringify(value) -> str:
    if value is None:
        return ""
    if hasattr(value, "value"):
        return str(value.value)
    return str(value)


def _pick_first_value(obj, candidates: list[str]) -> str:
    for name in candidates:
        if hasattr(obj, name):
            value = getattr(obj, name)
            text = _stringify(value).strip()
            if text:
                return text
    return ""


def _build_result_url(model_name: str, row) -> str:
    if model_name == "Page":
        return _page_url(row)

    if model_name == "Cuadernillo":
        return row.archivo or "/clasificador-de-cultivos"

    if model_name == "MenuItem":
        return row.url or "/"

    if model_name == "Media":
        return row.url or "/"

    if model_name == "Posts":
        return f"/comunidad/{row.slug}" if getattr(row, "slug", None) else "/comunidad"

    if model_name == "Mapa":
        return f"/mapas-historicos/{row.slug}" if getattr(row, "slug", None) else "/mapas-historicos"

    if model_name == "Cursos":
        return f"/cursos/{row.slug}" if getattr(row, "slug", None) else "/cursos"

    if model_name == "Flashes":
        return f"/flashes/{row.slug}" if getattr(row, "slug", None) else "/flashes"

    slug = getattr(row, "slug", None)
    if slug:
        prefix = ROUTE_PREFIX_BY_MODEL.get(model_name)
        if prefix:
            return f"{prefix}/{slug}"
        return f"/{slug}"

    for field in ["url", "link", "archivo", "documento", "slug_custom"]:
        if hasattr(row, field):
            value = _stringify(getattr(row, field)).strip()
            if value:
                if field == "slug_custom" and not value.startswith("/") and not _external_url(value):
                    return f"/{value}"
                return value

    return "/"


def _build_row_title(row) -> str:
    return _pick_first_value(
        row,
        [
            "title",
            "titulo",
            "nombre",
            "label",
            "name",
            "resource_type",
            "slug",
            "pregunta",
            "cifras",
        ],
    ) or f"Registro {getattr(row, 'id', '')}".strip()


def _build_row_description(row) -> str:
    description = _pick_first_value(
        row,
        [
            "description",
            "descripcion",
            "resumen",
            "contenido",
            "description_meta",
            "keywords_meta",
            "claves",
            "puesto",
            "cargo",
            "autor",
            "tipo",
            "archivo",
            "link",
            "url",
            "email",
            "municipio",
            "anyo",
            "respuesta",
            "area"
            "informacion",
            "ubicacion",
            "desc_jal",
            "desc_nal",
            "fuente",
            "Objetivo",
            "p_ingreso",
            "p_egreso",
        ],
    )
    return description[:240]


@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query(..., min_length=2, description="Termino de busqueda"),
    limit: int = Query(60, ge=1, le=200, description="Maximo total de resultados"),
    per_source: int = Query(30, ge=1, le=100, description="Maximo por modelo"),
    db: Session = Depends(get_db),
):
    query = q.strip()
    like = f"%{query}%"

    results = []

    for model in _iter_search_models():
        conditions = []
        for column in model.__table__.columns:
            if column.name in EXCLUDED_COLUMNS:
                continue
            if column.primary_key:
                continue
            conditions.append(cast(column, String).ilike(like))

        if not conditions:
            continue

        try:
            rows = db.query(model).filter(or_(*conditions)).limit(per_source).all()
        except SQLAlchemyError as exc:
            # Some environments may have partial migrations; skip incompatible models.
            logger.warning("Skipping model %s in global search: %s", model.__name__, exc)
            db.rollback()
            continue

        model_name = model.__name__
        type_label = TYPE_LABEL_BY_MODEL.get(model_name, model_name)

        for row in rows:
            row_id = _pick_first_value(row, ["id", "slug", "path", "name", "resource_id"]) or "item"
            url = _build_result_url(model_name, row)
            title = _build_row_title(row)
            description = _build_row_description(row)
            score = _compute_relevance(model_name, row, query, title, description)
            results.append(
                {
                    "id": f"{model.__tablename__}-{row_id}",
                    "type": type_label,
                    "title": title,
                    "description": description,
                    "url": url,
                    "tipo_curso": _stringify(getattr(row, "tipo_curso", None)),
                    "external": _external_url(url),
                    "archivo": _stringify(getattr(row, "archivo", None)),
                    "link": _stringify(getattr(row, "link", None)),
                    "enlace": _stringify(getattr(row, "enlace", None)),
                    "_score": score,
                }
            )

    ordered_results = sorted(
        results,
        key=lambda item: (item.get("_score", 0), item.get("title", "")),
        reverse=True,
    )
    limited_results = ordered_results[:limit]
    for item in limited_results:
        item.pop("_score", None)

    return {
        "query": query,
        "total": len(limited_results),
        "results": limited_results,
    }
