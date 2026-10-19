# Importacion Masiva

Esta guia define la convención para futuros importadores de datos del backend.

## Convencion de archivos

- Script de importacion: `api/scripts/import_<modelo>_data.py`
- Wrapper opcional de compatibilidad: `api/scripts/import_<modelo>.py`
- Archivos de ejemplo: `api/scripts/examples/<modelo>_import_example.csv` y `api/scripts/examples/<modelo>_import_example.json`

Ejemplo actual:

- `api/scripts/import_reportes_data.py`
- `api/scripts/import_reportes.py`
- `api/scripts/examples/reportes_import_example.csv`
- `api/scripts/examples/reportes_import_example.json`
- `api/scripts/import_posts_data.py`
- `api/scripts/import_posts.py`
- `api/scripts/examples/posts_import_example.csv`
- `api/scripts/examples/posts_import_example.json`

## Comando generico

Usa siempre el target generico del Makefile:

```bash
make import-data \
  SCRIPT=api/scripts/import_reportes_data.py \
  SOURCE=api/scripts/examples/reportes_import_example.csv \
  ENV=dev \
  DRY_RUN=1
```

Alias especifico para reportes:

```bash
make import-reportes SOURCE=api/scripts/examples/reportes_import_example.csv ENV=dev DRY_RUN=1

Alias especifico para posts:

```bash
make import-posts SOURCE=api/scripts/examples/posts_import_example.csv ENV=dev DRY_RUN=1
```
```

Parámetros soportados por convención:

- `SCRIPT`: script de importacion a ejecutar
- `SOURCE`: archivo CSV o JSON a procesar
- `ENV`: `dev`, `prod` o `monolito`
- `MODE`: `upsert` o `insert`
- `LIMIT`: procesa solo los primeros N registros
- `DRY_RUN=1`: valida sin guardar cambios
- `ARGS`: flags extra del importador

## Estructura esperada del importador

Cada script nuevo debe seguir este flujo:

1. Cargar el archivo fuente JSON o CSV.
2. Normalizar columnas al esquema del modelo.
3. Resolver relaciones antes de escribir.
4. Definir una llave natural para `upsert`.
5. Hacer `rollback` completo si falla cualquier registro.
6. Ejecutar primero con `DRY_RUN=1`.

## Recomendaciones para archivos

- Si el modelo usa `archivo`, importa una URL o ruta ya existente en media/acervo.
- No mezcles subida binaria y alta de metadatos en el mismo proceso masivo.
- Si el CSV trae listas, usa `|` como separador: `1|4|8`.
- Si el importador depende de relaciones como temas, valida que esos registros ya existan antes de correr en modo real.
- Para `posts.contenido`, usa JSON de TipTap serializado (objeto `doc` con arreglo `content`).
- En `posts`, también puedes usar la columna `contenido_html`; el importador la convierte a JSON de TipTap si `contenido` viene vacío.

## Plantilla base

Puedes clonar `api/scripts/import_model_template.py` para crear el siguiente importador.

Pasos sugeridos:

1. Copia el archivo con el nombre `import_<modelo>_data.py`.
2. Ajusta `normalize_row()` al layout real del archivo origen.
3. Implementa `build_or_update_model()` con el ORM del modelo.
4. Agrega ejemplos en `api/scripts/examples/`.
5. Prueba con `make import-data ... DRY_RUN=1` antes de ejecutar sin `DRY_RUN`.