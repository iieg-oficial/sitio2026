import argparse
from typing import Any

from import_generic_model_data import import_model_data

MODEL_NAME = "Page"

def page_payload_hook(row: dict[str, Any], payload: dict[str, Any]) -> None:
    """Aplica la relación entre link_interno y slug_custom.

    - link_interno=True (o ausente, que es el default de la columna):
      slug_custom no se usa para redirigir, así que si no vino, se espeja
      con 'slug' para no violar el NOT NULL.
    - link_interno=False: la página redirige a un sistema externo, por lo
      que slug_custom es obligatorio (debe traer la URL destino).
    """
    link_interno = payload.get("link_interno", True)

    if link_interno:
        if not payload.get("slug_custom"):
            payload["slug_custom"] = payload.get("slug")
    else:
        if not payload.get("slug_custom"):
            titulo = payload.get("title", "?")
            raise ValueError(
                f"Fila con link_interno=false y sin 'slug_custom' "
                f"(URL externa obligatoria). title={titulo}"
            )

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importador para el modelo Page")
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


def main() -> None:
    args = parse_args()
    import_model_data(
        model_name=MODEL_NAME,
        source_path=args.source,
        mode=args.mode,
        key_field=args.key_field,
        limit=args.limit,
        dry_run=args.dry_run,
        payload_hook=page_payload_hook,
    )


if __name__ == "__main__":
    main()
