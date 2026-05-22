import argparse
import csv
import json
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.sql.sqltypes import Boolean, Date, DateTime, Enum, Integer, JSON

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models import Base


DEFAULT_KEY_CANDIDATES = [
    "slug",
    "username",
    "email",
    "name",
    "nombre",
    "title",
    "titulo",
    "label",
    "path",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Importador genérico para modelos SQLAlchemy desde JSON o CSV"
    )
    parser.add_argument("model", help="Nombre de clase del modelo (ej. Subject, Banner)")
    parser.add_argument("source", help="Ruta al archivo .json o .csv")
    parser.add_argument(
        "--mode",
        choices=["insert", "upsert"],
        default="upsert",
        help="insert crea siempre; upsert actualiza por llave natural si ya existe",
    )
    parser.add_argument(
        "--key-field",
        default=None,
        help="Campo para upsert. Si se omite, se detecta automáticamente",
    )
    parser.add_argument("--limit", type=int, default=None, help="Procesa solo los primeros N")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Valida y muestra resultados sin confirmar en base de datos",
    )
    return parser.parse_args()


def load_rows(source: Path) -> list[dict[str, Any]]:
    if source.suffix.lower() == ".json":
        data = json.loads(source.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError("El JSON debe ser una lista de objetos")
        if not all(isinstance(item, dict) for item in data):
            raise ValueError("Cada elemento del JSON debe ser un objeto")
        return data

    if source.suffix.lower() == ".csv":
        with source.open("r", encoding="utf-8-sig", newline="") as handle:
            return list(csv.DictReader(handle))

    raise ValueError("Formato no soportado. Usa .json o .csv")


def resolve_model(model_name: str):
    model_cls = getattr(sys.modules["app.models"], model_name, None)
    if model_cls is None:
        raise ValueError(f"Modelo no encontrado en app.models: {model_name}")

    if not isinstance(model_cls, type) or not issubclass(model_cls, Base):
        raise ValueError(f"{model_name} no es un modelo SQLAlchemy válido")

    if not hasattr(model_cls, "__table__"):
        raise ValueError(f"{model_name} no define una tabla SQLAlchemy")

    return model_cls


def parse_datetime(value: str) -> datetime:
    text = value.strip()
    patterns = [
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y/%m/%d",
    ]
    for pattern in patterns:
        try:
            return datetime.strptime(text, pattern)
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(text)
    except ValueError as exc:
        raise ValueError(f"Fecha inválida: {value}") from exc


def parse_bool(value: str) -> bool:
    normalized = value.strip().lower()
    truthy = {"1", "true", "t", "yes", "y", "si", "sí"}
    falsy = {"0", "false", "f", "no", "n"}
    if normalized in truthy:
        return True
    if normalized in falsy:
        return False
    raise ValueError(f"Booleano inválido: {value}")


def parse_enum(enum_type, value: str):
    text = value.strip()
    for candidate in enum_type.enums:
        if str(candidate).lower() == text.lower():
            return candidate
    raise ValueError(f"Valor enum inválido: {value}. Válidos: {enum_type.enums}")


def convert_value(column, raw_value: Any) -> Any:
    if raw_value is None:
        return None

    if isinstance(raw_value, str):
        value = raw_value.strip()
        if value == "":
            return None
    else:
        value = raw_value

    col_type = column.type

    if isinstance(col_type, Integer):
        if isinstance(value, int):
            return value
        return int(value)

    if isinstance(col_type, Boolean):
        if isinstance(value, bool):
            return value
        return parse_bool(str(value))

    if isinstance(col_type, DateTime):
        if isinstance(value, datetime):
            return value
        return parse_datetime(str(value))

    if isinstance(col_type, Date):
        if isinstance(value, date) and not isinstance(value, datetime):
            return value
        return parse_datetime(str(value)).date()

    if isinstance(col_type, Enum):
        return parse_enum(col_type, str(value))

    if isinstance(col_type, JSON):
        if isinstance(value, (dict, list)):
            return value
        return json.loads(str(value))

    return value


def find_row_value(row: dict[str, Any], field_name: str) -> Any:
    if field_name in row:
        return row[field_name]

    lowered = {str(key).lower(): key for key in row.keys()}
    match = lowered.get(field_name.lower())
    if match is not None:
        return row[match]

    return None


def build_payload(model_cls, row: dict[str, Any]) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    columns = model_cls.__table__.columns

    for column in columns:
        if column.primary_key and column.autoincrement:
            continue

        raw_value = find_row_value(row, column.name)
        if raw_value is None:
            continue

        payload[column.name] = convert_value(column, raw_value)

    if "slug" in columns and not payload.get("slug"):
        source_fields = ["titulo", "title", "nombre", "name", "label"]
        for field_name in source_fields:
            source_value = payload.get(field_name)
            if source_value:
                payload["slug"] = slugify(str(source_value))
                break

    return payload


def resolve_key_field(model_cls, explicit_key_field: str | None) -> str | None:
    columns = {col.name for col in model_cls.__table__.columns}

    if explicit_key_field:
        if explicit_key_field not in columns:
            raise ValueError(
                f"El campo de llave '{explicit_key_field}' no existe en {model_cls.__name__}"
            )
        return explicit_key_field

    for candidate in DEFAULT_KEY_CANDIDATES:
        if candidate in columns:
            return candidate

    return None


def unique_slug(db, model_cls, requested_slug: str, current_id: int | None = None) -> str:
    slug = requested_slug
    base_slug = requested_slug
    counter = 1

    while True:
        existing = db.execute(select(model_cls).where(model_cls.slug == slug)).scalars().first()
        if not existing or getattr(existing, "id", None) == current_id:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


def upsert_row(db, model_cls, payload: dict[str, Any], mode: str, key_field: str | None):
    if not payload:
        raise ValueError("El registro no contiene columnas válidas para importar")

    existing = None
    if key_field and payload.get(key_field) is not None:
        existing = (
            db.execute(select(model_cls).where(getattr(model_cls, key_field) == payload[key_field]))
            .scalars()
            .first()
        )

    if existing and mode == "insert":
        existing = None
        if "slug" in payload:
            payload["slug"] = unique_slug(db, model_cls, payload["slug"])

    if existing:
        for field, value in payload.items():
            setattr(existing, field, value)
        return existing, "updated"

    if "slug" in payload:
        payload["slug"] = unique_slug(db, model_cls, payload["slug"])

    instance = model_cls(**payload)
    db.add(instance)
    return instance, "created"


def import_model_data(
    model_name: str,
    source_path: str,
    mode: str = "upsert",
    key_field: str | None = None,
    limit: int | None = None,
    dry_run: bool = False,
) -> None:
    source = Path(source_path)
    if not source.exists():
        raise FileNotFoundError(f"No existe el archivo: {source}")

    model_cls = resolve_model(model_name)
    rows = load_rows(source)
    if limit is not None:
        rows = rows[:limit]

    effective_key_field = resolve_key_field(model_cls, key_field)

    db = SessionLocal()
    created = 0
    updated = 0

    try:
        for index, row in enumerate(rows, start=1):
            payload = build_payload(model_cls, row)
            _, action = upsert_row(db, model_cls, payload, mode, effective_key_field)

            if action == "created":
                created += 1
            else:
                updated += 1

            ref_field = effective_key_field or "id"
            ref_value = payload.get(ref_field, "-")
            print(f"[{index}] {action.upper()} {ref_field}={ref_value}")

        if dry_run:
            db.rollback()
            print(
                f"Dry run completado para {model_cls.__name__}. Creados={created}, actualizados={updated}"
            )
            return

        db.commit()
        print(
            f"Importación completada para {model_cls.__name__}. Creados={created}, actualizados={updated}"
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    args = parse_args()
    import_model_data(
        model_name=args.model,
        source_path=args.source,
        mode=args.mode,
        key_field=args.key_field,
        limit=args.limit,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()