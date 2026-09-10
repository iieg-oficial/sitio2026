import argparse
import csv
import json
import sys
from pathlib import Path

from slugify import slugify
from sqlalchemy import select

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models import Subject


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Plantilla base para importadores masivos desde JSON o CSV"
    )
    parser.add_argument("source", help="Ruta al archivo .json o .csv")
    parser.add_argument(
        "--mode",
        choices=["insert", "upsert"],
        default="upsert",
        help="insert crea siempre; upsert actualiza por llave natural si ya existe",
    )
    parser.add_argument("--limit", type=int, default=None, help="Procesa solo los primeros N")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Valida y muestra resultados sin confirmar en base de datos",
    )
    return parser.parse_args()


def load_rows(source: Path) -> list[dict]:
    if source.suffix.lower() == ".json":
        data = json.loads(source.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError("El JSON debe ser una lista de objetos")
        return data

    if source.suffix.lower() == ".csv":
        with source.open("r", encoding="utf-8-sig", newline="") as handle:
            return list(csv.DictReader(handle))

    raise ValueError("Formato no soportado. Usa .json o .csv")


def split_values(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value).split("|") if item.strip()]


def resolve_temas(db, tema_ids: list[int], tema_slugs: list[str]) -> list[Subject]:
    temas: list[Subject] = []

    if tema_ids:
        temas_by_id = db.execute(select(Subject).where(Subject.id.in_(tema_ids))).scalars().all()
        found_ids = {tema.id for tema in temas_by_id}
        missing_ids = [tema_id for tema_id in tema_ids if tema_id not in found_ids]
        if missing_ids:
            raise ValueError(f"No existen temas con id: {missing_ids}")
        temas.extend(temas_by_id)

    if tema_slugs:
        temas_by_slug = db.execute(select(Subject).where(Subject.slug.in_(tema_slugs))).scalars().all()
        found_slugs = {tema.slug for tema in temas_by_slug}
        missing_slugs = [tema_slug for tema_slug in tema_slugs if tema_slug not in found_slugs]
        if missing_slugs:
            raise ValueError(f"No existen temas con slug: {missing_slugs}")

        existing_ids = {tema.id for tema in temas}
        temas.extend([tema for tema in temas_by_slug if tema.id not in existing_ids])

    return temas


def unique_slug(db, model_cls, requested_slug: str, current_id: int | None = None) -> str:
    slug = requested_slug
    base_slug = requested_slug
    counter = 1

    while True:
        existing = db.execute(select(model_cls).where(model_cls.slug == slug)).scalars().first()
        if not existing or existing.id == current_id:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


def normalize_row(row: dict) -> dict:
    titulo = (row.get("titulo") or "").strip()
    if not titulo:
        raise ValueError("Cada registro debe incluir titulo")

    return {
        "titulo": titulo,
        "slug": (row.get("slug") or "").strip() or slugify(titulo),
        "archivo": (row.get("archivo") or "").strip() or None,
        "tema_ids": [int(item) for item in split_values(row.get("tema_ids"))],
        "tema_slugs": split_values(row.get("tema_slugs")),
    }


def build_or_update_model(db, payload: dict, mode: str):
    raise NotImplementedError("Implementa la lógica específica del modelo")


def main() -> None:
    args = parse_args()
    source = Path(args.source)
    if not source.exists():
        raise FileNotFoundError(f"No existe el archivo: {source}")

    rows = load_rows(source)
    if args.limit is not None:
        rows = rows[: args.limit]

    db = SessionLocal()
    created = 0
    updated = 0

    try:
        for index, row in enumerate(rows, start=1):
            payload = normalize_row(row)
            _, action = build_or_update_model(db, payload, args.mode)
            if action == "created":
                created += 1
            else:
                updated += 1

            print(f"[{index}] {action.upper()} clave={payload['slug']} titulo={payload['titulo']}")

        if args.dry_run:
            db.rollback()
            print(f"Dry run completado. Creados={created}, actualizados={updated}")
            return

        db.commit()
        print(f"Importación completada. Creados={created}, actualizados={updated}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
