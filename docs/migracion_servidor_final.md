# Migracion del servidor provisional al servidor final

Esta guia aplica a este repositorio, que ejecuta el portal, la API, CKAN, dos bases de datos PostgreSQL, Solr, Redis y un Acervo S3-compatible.

## Resumen de la estrategia

La opcion recomendada es una migracion con corte controlado:

1. Preparar el servidor final con la misma version del repositorio y Docker Compose.
2. Respaldar las dos bases de datos y verificar el respaldo.
3. Mantener el mismo Acervo y sus buckets. Si el Acervo tambien cambia, copiar sus objetos antes del corte.
4. Restaurar las bases de datos en el servidor final y levantar el stack sin cambiar los identificadores ni los prefijos de archivos.
5. Probar el portal y CKAN usando el dominio final, pero sin cambiar aun el DNS.
6. Congelar escrituras, tomar un respaldo final, cambiar DNS y conservar el servidor provisional disponible para rollback.

No conviene copiar solamente el repositorio: el contenido generado vive principalmente en PostgreSQL y los archivos viven en el Acervo. Tampoco conviene ejecutar `make clean` antes de respaldar, porque elimina los volumenes de las bases de datos.

## 1. Datos que deben migrarse

| Componente | Que conservar | Accion |
|---|---|---|
| PostgreSQL portal | paginas, menu, posts, multimedia, usuarios y demas tablas de la API | `pg_dump` y restauracion |
| PostgreSQL CKAN | `ckan_default` y `datastore_default` | respaldar ambas bases |
| Acervo S3 | buckets `portal` e `iieg`, especialmente el prefijo `datos-abiertos` | reutilizarlo o copiar todos los objetos |
| `ckan_storage` | configuracion y archivos locales de CKAN, si existieran | conservar el volumen o respaldarlo |
| Solr | indice de busqueda | se puede reconstruir desde CKAN; respaldarlo es opcional |
| Redis | cache y sesiones | no es fuente de verdad; no es necesario migrarlo |

Los volumenes Docker no tienen que conservar el mismo nombre en otro host. Lo importante es restaurar los datos y levantar los servicios con el mismo esquema, bucket y prefijo.

## 2. Preparar el servidor final

En el servidor final:

```bash
git clone <URL_DEL_REPOSITORIO> sitio2026
cd sitio2026
git checkout <COMMIT_O_TAG_VALIDADO>
make setup
```

Completa `.env.production` con valores del servidor final. No copies secretos sin revisarlos. Genera secretos nuevos para una instalacion nueva, pero conserva temporalmente las claves de firma si se necesita mantener sesiones o tokens existentes.

Variables que deben apuntar al dominio final:

```dotenv
CKAN_SITE_URL=https://<DOMINIO_FINAL>
CKAN_DOWNLOAD_PROXY=https://<DOMINIO_FINAL>/acervo
VITE_WEB_API_URL=https://<DOMINIO_FINAL>/api/sitio
VITE_ADMIN_API_URL=https://<DOMINIO_FINAL>/api/sitio-admin
CORS_ORIGINS=["https://<DOMINIO_FINAL>"]
COOKIE_SECURE=true
COOKIE_DOMAIN=<DOMINIO_FINAL>
```

`CKAN_SITE_URL` debe ser solamente el host, sin `/datos-abiertos`; el prefijo lo agrega `CKAN__ROOT_PATH=/datos-abiertos/{{LANG}}`. `CKAN_S3_STORAGE_PATH` debe continuar siendo `datos-abiertos` si no se van a mover los objetos.

Configura tambien:

- `ACERVO_S3_URL` para que API y CKAN puedan escribir y leer desde el Acervo.
- `ACERVO_PUBLIC_ENDPOINT` para que las imagenes y archivos del portal tengan una URL publica valida.
- `ACERVO_UPSTREAM_URL` y `ACERVO_UPSTREAM_HOST` para que Nginx pueda servir `/acervo/`.
- La misma red externa `iieg-network` solamente si se usara `ENV=gcp` y el Acervo vive en esa red.

El archivo `.env.production` actual contiene valores de prueba (`localhost`) y un proxy basado en IP. No debe usarse sin reemplazarlos por los valores finales.

## 3. Respaldar el servidor provisional

Ejecuta esto en el servidor provisional, con el stack detenido o durante una ventana de mantenimiento:

```bash
mkdir -p backups/$(date +%F)
STAMP=$(date +%F-%H%M)

docker exec portal-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
  > "backups/$STAMP-portal.dump"

docker exec portal-ckan-db pg_dump -U postgres -d ckan_default -Fc \
  > "backups/$STAMP-ckan.dump"
docker exec portal-ckan-db pg_dump -U postgres -d datastore_default -Fc \
  > "backups/$STAMP-datastore.dump"

docker run --rm -v portal_ckan_storage:/data -v "$PWD/backups":/backup alpine \
  tar czf "/backup/$STAMP-ckan-storage.tgz" -C /data .

sha256sum backups/$STAMP-*
```

Los nombres reales de los volumenes pueden variar por `COMPOSE_PROJECT_NAME`; compruebalos con `docker volume ls`. Copia los dumps y el archivo `ckan-storage` al servidor final por un canal seguro.

Si el Acervo va a cambiar, realiza una copia S3 de ambos buckets conservando exactamente las claves. Como minimo valida el conteo y el tamaño total de objetos antes y despues. Si se conserva el Acervo actual, no hay que copiar los objetos.

## 4. Restaurar en el servidor final

Levanta primero la infraestructura para que se creen las bases vacias:

```bash
make up ENV=prod
```

Deten CKAN y API antes de restaurar para evitar escrituras concurrentes:

```bash
docker compose --env-file .env.production -f docker-compose.yml stop api ckan

cat backups/<STAMP>-portal.dump | docker exec -i portal-postgres \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner

cat backups/<STAMP>-ckan.dump | docker exec -i portal-ckan-db \
  pg_restore -U postgres -d ckan_default --clean --if-exists --no-owner --role=ckan
cat backups/<STAMP>-datastore.dump | docker exec -i portal-ckan-db \
  pg_restore -U postgres -d datastore_default --clean --if-exists --no-owner --role=ckan

docker compose --env-file .env.production -f docker-compose.yml start api ckan
```

Si se restaura en una base que no esta vacia, la opcion `--clean` elimina objetos existentes. Verifica el nombre de la base y conserva una copia del estado previo antes de usarla.

Ambas bases de CKAN tienen a `ckan` como propietario y CKAN se conecta con ese usuario. `--no-owner` evita conservar los propietarios del origen; `--role=ckan` asigna el rol correcto durante la restauracion. Si te conectas directamente como `ckan`, puedes omitir `--role=ckan`.

Después reconstruye CKAN si se cambio la imagen o el codigo:

```bash
make build ENV=prod
```

Solr puede reconstruirse con la reindexacion de CKAN. No borres el volumen de Solr hasta confirmar que CKAN funciona y que los datasets aparecen en la busqueda.

## 5. Verificacion de URLs antes del DNS

Prueba el dominio final apuntando temporalmente a la IP nueva mediante `/etc/hosts` o un DNS de prueba. Comprueba:

```bash
curl -I https://<DOMINIO_FINAL>/
curl -I https://<DOMINIO_FINAL>/datos-abiertos/
curl -fsS https://<DOMINIO_FINAL>/datos-abiertos/api/3/action/status_show
```

En el portal revisa una imagen del CMS, un PDF de cada tipo de contenido y un enlace interno. En CKAN revisa un dataset, una vista previa y la descarga de un recurso subido.

Para detectar URLs absolutas que aun mencionan el servidor provisional, ejecuta sobre la base del portal una consulta adaptada al host antiguo:

```sql
SELECT 'media.url' AS origen, COUNT(*)
FROM media
WHERE url LIKE '%HOST_PROVISIONAL%'
UNION ALL
SELECT 'media.thumbnail', COUNT(*)
FROM media
WHERE thumbnail LIKE '%HOST_PROVISIONAL%';
```

Ademas, inspecciona los campos de contenido que pueden contener enlaces (`pages`, `posts`, `gallery_images`, `menu_items`, `cuadernillos`, `documentacion`, `reportes` y otros modelos). El buscador del portal devuelve directamente campos como `url`, `link`, `archivo` y `documento`, por lo que un enlace absoluto antiguo puede salir publicado aunque la aplicacion este configurada correctamente.

## 6. Resultado de la revision del codigo

- Las rutas de CKAN se generan bajo `/datos-abiertos/<idioma>/`. Cambiar de servidor no cambia los IDs de datasets ni recursos si se restaura `ckan_default` y `datastore_default`.
- Para recursos CKAN de tipo `upload`, el tema/parche construye la descarga como `CKAN_DOWNLOAD_PROXY + bucket + clave`. Por tanto, con `CKAN_DOWNLOAD_PROXY=https://<DOMINIO_FINAL>/acervo` y el mismo bucket/prefijo, la descarga debe funcionar en el servidor final.
- El portal genera URLs del Acervo usando `ACERVO_PUBLIC_ENDPOINT`, pero las guarda en `media.url` y puede guardar URLs similares en contenido editorial. Cambiar la variable no reescribe las URLs ya almacenadas.
- Los recursos CKAN externos, los enlaces editoriales absolutos y los archivos importados desde URLs antiguas no se corrigen automaticamente.

La conclusion es: **las URLs generadas dinamicamente no se veran afectadas si el dominio final se configura antes del arranque; las URLs absolutas ya guardadas si pueden verse afectadas**. La alternativa mas estable es publicar el Acervo detrás de un nombre DNS permanente, por ejemplo `https://archivos.<DOMINIO_FINAL>`, y usar ese nombre desde el principio. Si el host provisional ya esta publicado en documentos, conserva redirecciones 301 durante una etapa de transicion o actualiza solo los campos verificados mediante un script respaldado.

## 7. Corte y rollback

1. Pon el portal y CKAN en modo mantenimiento o bloquea escrituras.
2. Ejecuta un ultimo `pg_dump` de las tres bases.
3. Repite la restauracion en el servidor final si hubo cambios desde el respaldo inicial.
4. Cambia el DNS y valida HTTPS, portal, admin, CKAN, uploads y descargas.
5. Observa logs y errores durante el periodo de transicion.
6. Mantén el servidor provisional sin escribir. Si hay un problema, revierte DNS y conserva los datos generados en un solo lado.

No habilites escrituras simultaneas en ambos servidores: produciria divergencia en PostgreSQL y en los objetos del Acervo.

## 8. Lista de aceptacion

- [ ] El certificado HTTPS corresponde al dominio final.
- [ ] Portal publico y `/portal-admin/` cargan correctamente.
- [ ] Login del portal funciona y las cookies tienen `Secure` y el dominio esperado.
- [ ] CKAN responde en `/datos-abiertos/` y conserva datasets, organizaciones y usuarios.
- [ ] La busqueda de CKAN encuentra datasets despues de reindexar si fue necesario.
- [ ] Un recurso CKAN subido descarga desde `/acervo/` sin conservar la IP provisional.
- [ ] Imagenes, PDFs y archivos del portal cargan desde el endpoint publico final.
- [ ] No quedan URLs del host provisional en las tablas de contenido.
- [ ] Los buckets y el conteo de objetos del Acervo coinciden.
- [ ] Los logs de Nginx, API y CKAN no muestran 404, 502 o errores S3.
- [ ] Existe un respaldo verificable y un plan de retorno DNS.