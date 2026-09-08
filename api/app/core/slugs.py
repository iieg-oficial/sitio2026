"""
Utilidad centralizada para generación de slugs únicos.

Uso:
    from app.core.slugs import make_unique_slug
    from app.models import MiModelo

    slug = make_unique_slug(db, MiModelo, "Mi Título")
    slug = make_unique_slug(db, MiModelo, "Mi Título", exclude_id=42)  # en PATCH
"""

from slugify import slugify
from sqlalchemy.orm import Session


def make_unique_slug(
    db: Session,
    model_cls,
    text: str,
    exclude_id: int | None = None,
) -> str:
    """
    Genera un slug único para ``model_cls`` a partir de ``text``.

    Si ya existe un registro con ese slug, agrega un sufijo numérico incremental
    (-1, -2, …) hasta encontrar un slug libre.

    Args:
        db:          Sesión activa de SQLAlchemy.
        model_cls:   Clase del modelo ORM (debe tener columna ``slug``).
        text:        Texto fuente para construir el slug.
        exclude_id:  ID del registro actual a ignorar en la búsqueda (útil en
                     operaciones PATCH/PUT para no colisionar consigo mismo).

    Returns:
        Un slug garantizado como único dentro de la tabla del modelo.
    """
    base_slug = slugify(text)
    slug = base_slug
    contador = 1

    while True:
        query = db.query(model_cls).filter(model_cls.slug == slug)
        if exclude_id is not None:
            query = query.filter(model_cls.id != exclude_id)
        if not query.first():
            break
        slug = f"{base_slug}-{contador}"
        contador += 1

    return slug
