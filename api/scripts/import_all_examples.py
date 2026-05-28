import argparse
import subprocess
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).parent
EXAMPLES_DIR = SCRIPT_DIR / "examples"


IMPORT_PLAN: list[dict[str, str | None]] = [
    {"name": "user", "script": "import_user.py", "example": "user_import_example.csv", "key_field": "username"},
    {"name": "subject", "script": "import_subject.py", "example": "subject_import_example.csv", "key_field": "slug"},
    {"name": "media_folder", "script": "import_media_folder.py", "example": "media_folder_import_example.csv", "key_field": "path"},
    {"name": "media", "script": "import_media.py", "example": "media_import_example.csv", "key_field": "url"},
    {"name": "banner", "script": "import_banner.py", "example": "banner_import_example.csv", "key_field": "slug"},
    {"name": "page", "script": "import_page.py", "example": "page_import_example.csv", "key_field": "slug"},
    {"name": "menu_item", "script": "import_menu_item.py", "example": "menu_item_import_example.csv", "key_field": "label"},
    {"name": "datos_nuevos", "script": "import_datos_nuevos.py", "example": "datos_nuevos_import_example.csv", "key_field": "slug"},
    {"name": "directorio", "script": "import_directorio.py", "example": "directorio_import_example.csv", "key_field": "slug"},
    {"name": "mapa", "script": "import_mapa.py", "example": "mapa_import_example.csv", "key_field": "slug"},
    {"name": "snieg", "script": "import_snieg.py", "example": "snieg_import_example.csv", "key_field": "slug"},
    {"name": "docs_iieg", "script": "import_docs_iieg.py", "example": "docs_iieg_import_example.csv", "key_field": "slug"},
    {"name": "organos", "script": "import_organos.py", "example": "organos_import_example.csv", "key_field": "slug"},
    {"name": "modulos", "script": "import_modulos.py", "example": "modulos_import_example.csv", "key_field": "slug"},
    {"name": "instituciones", "script": "import_instituciones.py", "example": "instituciones_import_example.csv", "key_field": "slug"},
    {"name": "perfiles", "script": "import_perfiles.py", "example": "perfiles_import_example.csv", "key_field": "slug"},
    {"name": "profesores", "script": "import_profesores.py", "example": "profesores_import_example.csv", "key_field": "slug"},
    {"name": "cursos", "script": "import_cursos.py", "example": "cursos_import_example.csv", "key_field": "slug"},
    {"name": "documentacion", "script": "import_documentacion.py", "example": "documentacion_import_example.csv", "key_field": "slug"},
    {"name": "preguntas", "script": "import_preguntas.py", "example": "preguntas_import_example.csv", "key_field": "slug"},
    {"name": "flashes", "script": "import_flashes.py", "example": "flashes_import_example.csv", "key_field": "slug"},
    {"name": "archivos", "script": "import_archivos.py", "example": "archivos_import_example.csv", "key_field": "slug"},
    {"name": "sistemas", "script": "import_sistemas.py", "example": "sistemas_import_example.csv", "key_field": "slug"},
    {"name": "cuadernillos", "script": "import_cuadernillos.py", "example": "cuadernillos_import_example.csv", "key_field": "slug"},
    {"name": "posts", "script": "import_posts.py", "example": "posts_import_example.csv", "key_field": None},
    {"name": "reportes", "script": "import_reportes.py", "example": "reportes_import_example.csv", "key_field": None},
    {"name": "borrador", "script": "import_borrador.py", "example": "borrador_import_example.csv", "key_field": "resource_id"},
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Ejecuta todos los importadores contra los CSV de ejemplo"
    )
    parser.add_argument(
        "--mode",
        choices=["insert", "upsert"],
        default="upsert",
        help="Modo de importacion para todos los importadores",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Ejecuta validaciones sin confirmar cambios en base de datos",
    )
    parser.add_argument(
        "--only",
        default=None,
        help="Lista separada por comas con los importadores a ejecutar",
    )
    parser.add_argument(
        "--skip",
        default=None,
        help="Lista separada por comas con los importadores a omitir",
    )
    parser.add_argument(
        "--stop-on-error",
        action="store_true",
        help="Detiene la ejecucion al primer error",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="Muestra el plan disponible y termina",
    )
    return parser.parse_args()


def parse_csv_list(value: str | None) -> set[str]:
    if not value:
        return set()
    return {item.strip() for item in value.split(",") if item.strip()}


def filter_plan(only: set[str], skip: set[str]) -> list[dict[str, str | None]]:
    selected = IMPORT_PLAN

    if only:
        selected = [item for item in selected if item["name"] in only]

    if skip:
        selected = [item for item in selected if item["name"] not in skip]

    return selected


def print_plan(plan: list[dict[str, str | None]]) -> None:
    print("Plan de importacion:")
    for idx, item in enumerate(plan, start=1):
        print(f"{idx:02d}. {item['name']} -> {item['script']} ({item['example']})")


def build_command(item: dict[str, str | None], mode: str, dry_run: bool) -> list[str]:
    script_path = SCRIPT_DIR / str(item["script"])
    example_path = EXAMPLES_DIR / str(item["example"])
    key_field = item["key_field"]

    cmd = [sys.executable, str(script_path), str(example_path), "--mode", mode]

    if dry_run:
        cmd.append("--dry-run")

    if key_field and item["name"] not in {"posts", "reportes"}:
        cmd.extend(["--key-field", key_field])

    return cmd


def validate_files(plan: list[dict[str, str | None]]) -> None:
    missing: list[str] = []
    for item in plan:
        script_path = SCRIPT_DIR / str(item["script"])
        example_path = EXAMPLES_DIR / str(item["example"])
        if not script_path.exists():
            missing.append(f"Falta script: {script_path}")
        if not example_path.exists():
            missing.append(f"Falta CSV: {example_path}")

    if missing:
        detail = "\n".join(missing)
        raise FileNotFoundError(f"Faltan archivos requeridos:\n{detail}")


def main() -> None:
    args = parse_args()
    only = parse_csv_list(args.only)
    skip = parse_csv_list(args.skip)
    plan = filter_plan(only=only, skip=skip)

    if args.list:
        print_plan(plan)
        return

    if not plan:
        print("No hay importadores seleccionados para ejecutar.")
        return

    validate_files(plan)

    print_plan(plan)
    print("\nIniciando importacion masiva de ejemplos...\n")

    failures = 0
    for item in plan:
        name = str(item["name"])
        command = build_command(item=item, mode=args.mode, dry_run=args.dry_run)
        print(f"==> Ejecutando {name}")

        result = subprocess.run(command, cwd=SCRIPT_DIR)
        if result.returncode != 0:
            failures += 1
            print(f"ERROR en {name} (exit code {result.returncode})")
            if args.stop_on_error:
                raise SystemExit(result.returncode)
        else:
            print(f"OK {name}")

        print("")

    if failures:
        raise SystemExit(f"Terminado con errores. Fallos: {failures}")

    print("Importacion finalizada sin errores.")


if __name__ == "__main__":
    main()