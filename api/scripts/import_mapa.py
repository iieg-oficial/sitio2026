import argparse

from import_generic_model_data import import_model_data
from app.models.mapa import TipoMapaEnum


MODEL_NAME = "Mapa"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importador para el modelo Mapa")
    parser.add_argument("source", nargs="?", help="Ruta al archivo .json o .csv")
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
    parser.add_argument(
        "--list-tipos",
        action="store_true",
        help="Muestra los tipos válidos de mapa y termina",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.list_tipos:
        print("Tipos válidos para el campo 'tipo' en Mapa:")
        for tipo in TipoMapaEnum:
            print(f"- {tipo.name} -> {tipo.value}")
        return

    if not args.source:
        raise SystemExit("Debes proporcionar la ruta source o usar --list-tipos")

    import_model_data(
        model_name=MODEL_NAME,
        source_path=args.source,
        mode=args.mode,
        key_field=args.key_field,
        limit=args.limit,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
