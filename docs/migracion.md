# Respaldo y restauracion del proyecto

Esta guia cubre el CMS (`admin`, `api` y `web`), CKAN, la configuracion del repositorio, las bases de datos PostgreSQL y los volumenes auxiliares. El proceso **no respalda el Acervo ni Mariachi**: no copia buckets S3/SeaweedFS ni busca carpetas externas con esos nombres.

## 1. Requisitos

- Docker Engine y Docker Compose funcionando.
- El repositorio en la version que se desea respaldar.
- El entorno objetivo levantado con el mismo `ENV` que se va a respaldar.
- Espacio suficiente para los dumps y los volumenes.

No ejecutes `make clean` antes del respaldo: elimina los volumenes de las bases de datos.

## 2. Crear el respaldo

Desde la raiz del repositorio, usa el entorno correspondiente:

```bash
make backup ENV=prod
# o: make backup ENV=gcp
# o: make backup ENV=dev
```

La regla crea `backups/AAAA-MM-DD-HHMMSS/` con:

- `proyecto.tgz`: codigo de `admin`, `api`, `web`, `ckan`, `nginx`, scripts, compose, Makefile, documentacion y configuracion existente.
- `databases/portal.dump`: base principal de la API.
- `databases/ckan.dump` y `databases/datastore.dump`: bases de CKAN.
- `databases/*-globals.sql`: roles PostgreSQL.
- `volumes/ckan-storage.tgz`: almacenamiento local de CKAN.
- `volumes/ckan-solr.tgz`: indice de Solr.
- `volumes/redis.tgz`: cache y sesiones, util para conservar el estado aunque Redis no sea la fuente de verdad.
- `SHA256SUMS`: hashes para comprobar integridad.

El archivo del proyecto excluye `.git`, dependencias `node_modules`, salidas compiladas, `backups`, cualquier `static/uploads` y rutas llamadas `acervo` o `mariachi`. Tampoco incluye el volumen `seaweedfs_data_dev` ni ejecuta `make bucket-ls`; por tanto, los objetos del Acervo deben conservarse o migrarse mediante el procedimiento propio de ese servicio.

Comprueba el respaldo y copia el directorio completo a un almacenamiento seguro:

```bash
(cd backups/<MARCA_DE_TIEMPO> && sha256sum -c SHA256SUMS)
```

Los archivos `.env` pueden contener secretos y se incluyen si existen en el directorio del proyecto. Protege el respaldo y no lo publiques en Git.

## 3. Preparar el servidor de destino

Instala Docker, clona el repositorio y selecciona el mismo commit respaldado:

```bash
git clone <URL_DEL_REPOSITORIO> sitio2026
cd sitio2026
git checkout <COMMIT_RESPALDADO>
make setup
```

Configura `.env.production` con los valores del destino. Conserva las claves de firma si necesitas mantener sesiones/tokens; revisa especialmente las URLs, credenciales de PostgreSQL y las variables del Acervo. No reemplaces el Acervo por una copia del respaldo de este proyecto: debe seguir apuntando al servicio existente o migrarse por separado.

## 4. Restaurar codigo y volumenes

Desempaqueta `proyecto.tgz` sobre el repositorio, preservando los archivos `.env` que ya configuraste en el destino:

```bash
tar --exclude='./.env' --exclude='./.env.*' -xzf <RESPALDO>/proyecto.tgz -C /ruta/al/sitio2026
```

Los `.env` del respaldo quedan disponibles para comparación, pero no se aplican automáticamente.

Levanta el entorno para crear los servicios y volúmenes:

```bash
make build ENV=prod
```

`make build` crea los volúmenes y reconstruye las imágenes con el commit restaurado. No uses `make up` en este paso: podría levantar imágenes antiguas que ya existan en el destino.

Detén los servicios que escriben datos:

```bash
docker compose --env-file .env.production -f docker-compose.yml stop api ckan ckan-solr redisgit br
```

Restaura `ckan_storage` usando el volumen real montado por el servicio. El nombre puede incluir el prefijo del proyecto; obténlo con `docker volume ls` y reemplaza `<VOLUMEN_CKAN_STORAGE>`:

```bash
docker run --rm -v <VOLUMEN_CKAN_STORAGE>:/data -v "$PWD/<RESPALDO>/volumes":/backup alpine:3.22 \
  sh -c 'rm -rf /data/* /data/.[!.]* /data/..?* 2>/dev/null || true; tar xzf /backup/ckan-storage.tgz -C /data'
```

Solr y Redis son auxiliares. Puedes restaurarlos con el mismo patrón si necesitas conservar sus índices/sesiones, o dejarlos vacíos para que CKAN reconstruya el índice y Redis regenere la cache.

## 5. Restaurar las bases de datos

Detén API y CKAN antes de importar. Usa los nombres de base configurados en el compose y verifica el entorno antes de ejecutar `--clean`:

```bash
cat <RESPALDO>/databases/portal.dump | docker compose --env-file .env.production -f docker-compose.yml exec -T postgres \
  sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner'

cat <RESPALDO>/databases/ckan.dump | docker compose --env-file .env.production -f docker-compose.yml exec -T ckan-db \
  pg_restore -U postgres -d ckan_default --clean --if-exists --no-owner --role=ckan
cat <RESPALDO>/databases/datastore.dump | docker compose --env-file .env.production -f docker-compose.yml exec -T ckan-db \
  pg_restore -U postgres -d datastore_default --clean --if-exists --no-owner --role=ckan
```

No restaures `portal-globals.sql` ni `ckan-globals.sql` automáticamente: contienen `ALTER ROLE ... PASSWORD` con las credenciales del origen y sobrescribirían las contraseñas configuradas en el destino. Los roles y sus contraseñas ya se crean al inicializar los servicios; conserva estos archivos solo como referencia o revísalos y edítalos antes de importar cualquier sentencia global.

`ckan_default` y `datastore_default` deben conservar a `ckan` como propietario: CKAN se conecta con ese usuario. `--no-owner` evita restaurar propietarios del servidor de origen, mientras que `--role=ckan` hace que los objetos restaurados queden bajo el rol correcto. Si se conecta directamente como `ckan`, no es necesario pasar `--role=ckan`.

Después inicia los servicios:

```bash
docker compose --env-file .env.production -f docker-compose.yml start redis ckan-solr ckan api
```

Si Solr quedó vacío, reindexa CKAN antes de publicar el servicio:

```bash
docker compose --env-file .env.production -f docker-compose.yml exec ckan \
  ckan -c /srv/app/ckan.ini search-index rebuild
```

Valida que la reindexación haya producido resultados con `package_search` desde CKAN antes de publicar el servicio.

## 6. Migrar archivos CKAN y corregir la URL del Acervo

CKAN usa dos tipos de recursos y se corrigen de forma diferente:

| Tipo CKAN | Cómo funciona | Qué cambiar al migrar |
|---|---|---|
| `upload` | El archivo está en S3/SeaweedFS y la aplicación construye la descarga | Configurar el nuevo proxy, bucket y prefijo; conservar la misma clave del objeto |
| `link` | `resource.url` contiene una URL externa guardada en CKAN | Actualizar `resource.url` solo cuando apunte al servidor anterior |

### 6.1 Caso recomendado: conservar las claves del Acervo

La ruta que construye este proyecto para un archivo CKAN es:

```text
<CKAN_DOWNLOAD_PROXY>/<bucket>/<AWS_STORAGE_PATH>/resources/<resource_id>/<filename>
```

Ejemplo:

```text
https://portal.nuevo.gob.mx/acervo/portal/datos-abiertos/resources/<UUID>/reporte.xlsx
```

Para que los archivos existentes continúen funcionando:

1. Mantén el mismo bucket (`ACERVO_BUCKET_NAME`, normalmente `portal`).
2. Mantén el mismo prefijo (`CKAN_S3_STORAGE_PATH`, normalmente `datos-abiertos`).
3. Copia o conserva los objetos sin cambiar sus claves, especialmente `datos-abiertos/resources/`.
4. Conserva en la base de CKAN los mismos `resource_id` y nombres de archivo.
5. Cambia únicamente las variables del nuevo servidor:

```dotenv
ACERVO_S3_URL=http://<HOST_INTERNO_O_ENDPOINT_S3>
ACERVO_UPSTREAM_URL=http://<HOST_INTERNO_O_ENDPOINT_S3>
ACERVO_UPSTREAM_HOST=<HOST_INTERNO_O_ENDPOINT_S3>
CKAN_DOWNLOAD_PROXY=https://<DOMINIO_NUEVO>/acervo
CKAN_S3_STORAGE_PATH=datos-abiertos
ACERVO_BUCKET_NAME=portal
```

`ACERVO_S3_URL` es para que API/CKAN hablen con S3 y puede ser una URL interna. `CKAN_DOWNLOAD_PROXY` es la URL pública que debe usar el navegador. No pongas la ruta `/acervo` dentro de `ACERVO_S3_URL` si el endpoint S3 interno no la requiere; la ruta pública la resuelve Nginx mediante `CKAN_DOWNLOAD_PROXY`.

Reconstruye CKAN después de cambiar la configuración:

```bash
make build ENV=prod
```

Prueba un recurso existente y confirma que redirige al nuevo dominio:

```bash
curl -I https://<DOMINIO_NUEVO>/datos-abiertos/dataset/<DATASET>/resource/<UUID>/download
curl -fL -o /tmp/prueba-ckan.xlsx \
  https://<DOMINIO_NUEVO>/datos-abiertos/dataset/<DATASET>/resource/<UUID>/download
```

No es necesario ejecutar un `UPDATE` sobre todos los registros `upload`: este proyecto calcula su URL desde la configuración actual. Tampoco cambies los UUID de los recursos ni renombres objetos si quieres evitar modificar la base de CKAN.

### 6.2 Si el Acervo también cambia de servidor

El respaldo de este proyecto no copia el Acervo. Antes del corte, migra por separado los buckets y conserva exactamente las claves. Para una migración S3-compatible, copia al menos:

```text
portal/datos-abiertos/resources/
portal/archivos/
portal/media/
```

Los prefijos reales pueden variar; valida los objetos del bucket origen y destino con la herramienta S3 de tu infraestructura. Comprueba conteo y tamaño total antes de cambiar DNS. No borres el origen hasta validar descargas en el destino.

Si decides cambiar bucket o prefijo, debes hacer ambas cosas de forma coordinada:

1. Copiar los objetos a las nuevas claves, manteniendo cada `<resource_id>/<filename>`.
2. Cambiar `ACERVO_BUCKET_NAME` y/o `CKAN_S3_STORAGE_PATH` en el nuevo `.env`.
3. Reconstruir CKAN y probar varios recursos antiguos y nuevos.

Cambiar solo la variable sin mover los objetos produce enlaces correctos en apariencia, pero respuestas `404` al descargar.

### 6.3 Corregir enlaces externos guardados en CKAN

Primero identifica recursos `link` que todavía apuntan al host anterior. Ejecuta la consulta dentro de `ckan-db`, adaptando `<HOST_ANTERIOR>`:

```bash
docker compose --env-file .env.production -f docker-compose.yml exec -T ckan-db \
  psql -U postgres -d ckan_default -c \
  "SELECT id, url_type, url FROM resource WHERE url LIKE '%<HOST_ANTERIOR>%' ORDER BY id;"
```

Revisa los resultados y crea un respaldo de la base antes de corregirlos. Si todos los resultados son enlaces que deben cambiar, ejecuta una actualización específica, nunca un reemplazo indiscriminado:

```bash
docker compose --env-file .env.production -f docker-compose.yml exec -T ckan-db \
  psql -U postgres -d ckan_default -c \
  "UPDATE resource SET url = replace(url, 'https://<HOST_ANTERIOR>', 'https://<DOMINIO_NUEVO>') WHERE url_type = 'link' AND url LIKE 'https://<HOST_ANTERIOR>%';"
```

Si el host anterior aparece dentro de una URL de un archivo `upload`, no actualices ese campo automáticamente: revisa primero el `url_type`, porque la descarga se calcula con el proxy y la clave S3. Después de modificar recursos, limpia/reindexa Solr si la instalación lo requiere y valida cada URL afectada.

### 6.4 Nginx y compatibilidad durante el cambio

El nuevo Nginx debe publicar `/acervo/` y reenviar la ruta completa al endpoint S3/SeaweedFS. Mantén temporalmente el dominio anterior o una redirección solo si existen enlaces externos que aún no fueron corregidos. La redirección del sitio CKAN no sustituye una migración de objetos: el bucket y las claves deben estar disponibles en el destino.

## 7. Verificación y corte

Comprueba salud y contenido antes de cambiar DNS:

```bash
docker compose --env-file .env.production -f docker-compose.yml ps
curl -fsS https://<DOMINIO>/datos-abiertos/api/3/action/status_show
```

Valida login del admin, páginas, imágenes, descargas del portal, datasets de CKAN, preview y descargas. Las imágenes y archivos del Acervo no aparecerán por restaurar este proyecto; deben seguir disponibles en el bucket/servicio externo con las mismas claves y prefijos.

Para un corte final, bloquea escrituras, ejecuta otra vez `make backup ENV=...`, termina la copia del Acervo, restaura ese último respaldo y cambia DNS. Conserva el servidor anterior sin escrituras hasta terminar la validación para permitir rollback.






