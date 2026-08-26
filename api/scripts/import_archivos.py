import argparse

from import_generic_model_data import import_model_data


MODEL_NAME = "Archivos"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importador para el modelo Archivos")
    parser.add_argument("source", help="Ruta al archivo .json o .csv")
    parser.add_argument(
        "--mode",
        choices=["insert", "upsert"],
        default="upsert",
        help="insert crea siempre; upsert actualiza por llave natural",
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


def split_values(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value).split("|") if item.strip()]


def archivos_payload_hook(row: dict, payload: dict) -> None:
    tema_slugs = split_values(row.get("temas_slugs") or row.get("tema_slugs"))
    subtema_slugs = split_values(row.get("subtemas_slugs") or row.get("subtema_slugs"))
    
    all_slugs = list(set(tema_slugs + subtema_slugs))
    if all_slugs:
        row["temas_slugs"] = "|".join(all_slugs)


def main() -> None:
    args = parse_args()
    import_model_data(
        model_name=MODEL_NAME,
        source_path=args.source,
        mode=args.mode,
        key_field=args.key_field,
        limit=args.limit,
        dry_run=args.dry_run,
        payload_hook=archivos_payload_hook,
    )


if __name__ == "__main__":
    main()
