# Changelog

Todos los cambios notables se documentan en este archivo. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y versionado siguiendo [Semantic Versioning](https://semver.org/lang/es/).

## [1.10.0] - 2026-08-28

### Cambiado
- El entorno `gcp` pasa a llamarse `monolito` y `docker-compose.gcp.yml` a
  `docker-compose.monolito.yml`. El overlay nunca tuvo nada de GCP: lo único que hace es meter
  `nginx`, `api` y `ckan` en `iieg-network` con sus aliases, que es lo que hace falta cuando el
  portal comparte máquina con el gateway y el acervo. El nombre viejo ataba a un proveedor una
  capacidad que en realidad es «todo en una sola VM», y que se usa igual para probar en local.
  Alcanza a `DEPLOY_ENV`, a los atajos `up-seed-*` / `build-seed-*` y a los docs.
- `ENV` con un valor desconocido ahora **aborta** en vez de caer en silencio a `dev`. Antes
  cualquier typo —`ENV=gcp` incluido, después de este rename— entraba al `else` y levantaba el
  entorno de desarrollo con `.env.development`, lo que en una VM de producción es un fallo mudo.

---

## [1.10.0] - 2026-08-28

### Cambiado
- El entorno `gcp` pasa a llamarse `monolito` y `docker-compose.gcp.yml` a
  `docker-compose.monolito.yml`. El overlay nunca tuvo nada de GCP: lo único que hace es meter
  `nginx`, `api` y `ckan` en `iieg-network` con sus aliases, que es lo que hace falta cuando el
  portal comparte máquina con el gateway y el acervo. El nombre viejo ataba a un proveedor una
  capacidad que en realidad es «todo en una sola VM», y que se usa igual para probar en local.
  Alcanza a `DEPLOY_ENV`, a los atajos `up-seed-*` / `build-seed-*` y a los docs.
- `ENV` con un valor desconocido ahora **aborta** en vez de caer en silencio a `dev`. Antes
  cualquier typo —`ENV=gcp` incluido, después de este rename— entraba al `else` y levantaba el
  entorno de desarrollo con `.env.development`, lo que en una VM de producción es un fallo mudo.

---

## [Sin publicar]

### Cambiado
- El mapa de contacto pide el widget de MapaLab como `mapalab.js?v=1.5.0`. Los navegadores que guardaron la versión vieja, con caché de un año, no mostraban la tarjeta de la sede y pintaban el pie «Fuente: IIEG».
- `cuadernillos.municipio` conserva en PostgreSQL los nombres minúsculos de `MunicipioEnum`, mientras la API sigue validando y devolviendo sus valores capitalizados. Antes de desplegar sobre otra base, comprobar que no existan filas con etiquetas capitalizadas; si las hay, normalizarlas antes de publicar el código para evitar errores al leer cuadernillos.

## [1.9.0] - 2026-07-31

Preparación para colgar el portal de la raíz del dominio, detrás de gateway-hub.

### Cambiado
- Prefijos del API: `/api/portal` → `/api/sitio` y `/api/portal-admin` → `/api/sitio-admin`
  (`WEB_PREFIX` y `ADMIN_PREFIX` en ambos compose). `/api/portal` ya pertenece a mariachi, que lo
  sirve en el mismo dominio; detrás del gateway las peticiones del portal llegaban a otro servicio.
  Alcanza a los fallbacks del front, las rutas de `api/tests/`, los `VITE_*` y los docs.
- Cookie de sesión renombrada a `sitio_access_token`. Con el nombre anterior, `access_token`,
  entrar al CMS del portal pisaba la sesión de mariachi y viceversa.
- `.env.production.example` recuperó su nombre: estaba como `.env.productioncopy.example` y
  `scripts/init-env.sh` no lo encontraba, así que `make setup` no podía crear `.env.production`.

### Corregido
- El nginx del portal emite redirects relativos (`absolute_redirect off`). Escucha en `:80` sin TLS
  porque el gateway termina https, así que sus `return 301` salían con esquema `http`: detrás del
  gateway, `/datos-abiertos` respondía `Location: http://<dominio>/datos-abiertos/es/`.

### Agregado
- `ACERVO_API_KEY`, `ACERVO_API_KEY_HEADER` y `CKAN_S3_STORAGE_PATH` en `.env.production.example`.
  El compose ya las consumía, pero ninguna lleva `:?` y faltaban en silencio.
- Targets `deploy` y `_up-prod`, que son los que invoca `ecosystem-deploy` de gateway-hub. El
  portal entra al orquestador del ecosistema entre mapalab y el gateway: ocupa `location /`, así
  que si no está arriba la raíz del dominio responde 502. `deploy` reconstruye en modo `gcp`, no
  solo levanta, porque los prefijos del API viajan como build args del bundle.

---

## [1.8.0] - 2026-05-15

Documentación y bump de versión.

### Agregado
- `docs/AMBIENTES.md`, `docs/INFRAESTRUCTURA.md`, `docs/MEDIA_ACERVO.md`, `docs/FLOW_COMPONENTE.md`.
- `scripts/init-env.sh` invocado por `make setup` que genera secretos aleatorios con `openssl rand`.
- Confirmación interactiva en `make clean` (con `FORCE=1` para automatización).

### Cambiado
- README reescrito apuntando a los nuevos docs.
- `CONTRIBUTING.md` actualizado con convenciones actuales.
- `SECURITY.md` alcance ampliado a CKAN.

### Removido
- `api/test_connection.sh` con URLs y patrones de auth obsoletos.
- `admin/public/mockServiceWorker.js` y dependencia `msw` del admin.

---

## [1.7.0] - 2026-05-15

Reducción de variables de entorno.

### Cambiado
- Variables reducidas de 84 a ~50 (dev) y ~40 (prod). Convenciones técnicas hardcoded en `environment:` de los compose: `ALGORITHM`, `COOKIE_NAME`, `COOKIE_HTTPONLY`, `COOKIE_SAMESITE`, `COOKIE_MAX_AGE`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `CSRF_TOKEN_EXPIRE_MINUTES`, `ADMIN_PREFIX`, `WEB_PREFIX`, `OPENAPI_URL`, `DOCS_URL`, `REDOC_URL`, `ACERVO_REGION`, `CKAN__PLUGINS`, `CKAN_ROOT_PATH`, `CKAN_S3_*`, `CKAN_DB_SUPERUSER`, `CKAN_DB_USER`, `DATASTORE_RO_USER`, `PROJECT_NAME`, `VERSION`, `VITE_APP_NAME`, `VITE_ADMIN_APP_NAME`, `VITE_*_TIMEOUT`.
- Política: sin `${VAR:-default}` en compose. Si una variable falta en `.env`, el compose falla explícito (`${VAR:?...}`).

### Removido
- Variables duplicadas: `ACERVO_HOST_IP`, `DATABASE_URL`, `REDIS_URL`, `ENV`, `VITE_NODE_ENV` (estos se construyen o se derivan del modo del compose).

---

## [1.6.0] - 2026-05-15

Renombrar ruta del CMS para evitar colisiones.

### Cambiado
- Frontend del CMS: `/administrador` → `/portal-admin`.
- API admin: `/api/administrador` → `/api/portal-admin`.
- `admin/vite.config.js`, `admin/src/main.jsx`, `admin/src/services/api.js`, `nginx/Dockerfile`, `nginx/templates/portal.conf.template` y tests `api/tests/*` actualizados.
- Aliases de red Docker `portal-nginx`, `portal-api`, `portal-ckan` en `iieg-network` para no colisionar con otros contenedores nombrados `api`/`nginx` en el ecosistema.

### Corregido
- 404 alternantes causados por DNS round-robin a contenedores ajenos.

---

## [1.5.0] - 2026-05-15

Modos de despliegue separados.

### Agregado
- `docker-compose.gcp.yml` overlay: añade `iieg-network` external para escenarios donde el Acervo vive en la misma VM.
- Modo `gcp` en el Makefile (`make up ENV=gcp`).
- `NGINX_PORT` configurable (default `18080`), evita choque con puerto :80 ocupado por otros proyectos.

### Cambiado
- `Makefile`: tres modos `dev` / `prod` / `gcp` con sus env files (`.env.development` / `.env.production`).
- `nginx/templates/portal.conf.template`: procesado con `envsubst` (filtro `^ACERVO_`) para no tocar vars internas de nginx.

---

## [1.4.0] - 2026-05-15

Media multi-bucket en el CMS.

### Agregado
- Selector Segmented `Portal | IIEG` en `admin/src/pages/Media.jsx`.
- Listado, upload y borrado por bucket (`bucket=portal` lee de DB, `bucket=iieg` lee directo de S3).
- Variables `ACERVO_IIEG_ACCESS_KEY`, `ACERVO_IIEG_SECRET_KEY`, `ACERVO_IIEG_BUCKET_NAME`.
- `AcervoService` con clientes S3 por bucket y método `list_objects`.

### Cambiado
- `mediaService.js`: `getMediaFiles`, `uploadMediaFile`, `deleteMediaFile`, `deleteMultipleFiles` aceptan parámetro `bucket`.

---

## [1.3.0] - 2026-05-15

Acervo embebido en dev y migración a boto3.

### Agregado
- Servicio `seaweedfs` 4.23 en `docker-compose.dev.yml`. Crea buckets `portal` e `iieg` al iniciar. Desacopla el dev del repo `acervo`.
- `dev-seaweedfs/identities.json.template` con vars sustituidas por `sed` en el `init.sh`.

### Cambiado
- `api/app/services/acervo.py` reescrito con `boto3` (acepta `endpoint_url` con path, requerido para acervos detrás de gateway).
- `api/pyproject.toml`: `minio>=7.2,<8.0` → `boto3>=1.34,<2.0`.

### Corregido
- URL del Acervo con triple slash (`http:///acervo/...`): `ACERVO_PUBLIC_ENDPOINT` ahora incluye host.
- Proxy del Acervo en nginx: `rewrite ... break; proxy_pass $var;` (en vez de `proxy_pass $var/`) preserva URL-encoding de firmas S3v4.

---

## [1.2.0] - 2026-05-15

CKAN integrado como portal de datos abiertos.

### Agregado
- CKAN 2.11.5 en `/datos-abiertos/`.
- Build custom `ckan/Dockerfile` con `ckanext-xloader` 2.3.0 y `ckanext-s3filestore` (instalados como editable porque la imagen base secuestra `ckanext.__path__`).
- Postgres dedicado para CKAN (`ckan-db`, postgres 16) con init script que crea users y DBs `ckan_default` + `datastore_default`.
- Solr 9 (`ckan/ckan-solr:2.11-solr9`).
- Redis compartido con el portal (CKAN usa DB 1, portal usa DB 0).
- Plugins por defecto: `envvars image_view text_view datatables_view datastore xloader activity s3filestore`.

### Cambiado
- `CKAN_SITE_URL`: solo el host (sin path) para evitar duplicación con `CKAN__ROOT_PATH=/datos-abiertos`.
- Imagen CKAN en dev: `ckan/ckan-dev:2.11.5` → `ckan/ckan-base:2.11.5` (sin Flask Debug Toolbar que rompía htmx en modales de upload).

### Corregido
- Plugin `recline_view` deprecado sustituido por `datatables_view`.
- `CKAN__UPLOADS_ENABLED=true` (default era `false` en la imagen base).
- Redirects con doble prefijo `/datos-abiertos/datos-abiertos/`: removido `X-Script-Name` del nginx, `CKAN_SITE_URL` sin path.
- 301 desde `/datos-abiertos/login`, `/logout`, `/register` a `/user/<x>`.
- Locations `/base/`, `/webassets/`, `/_debug_toolbar/` en nginx (paths que CKAN genera sin prefijo).

---

## [1.1.0] - 2026-05-15

Limpieza de nginx y variables de entorno.

### Agregado
- `.env.development.example` y `.env.production.example` con placeholders `<...>`.
- `.gitignore` cubriendo `.env*` (permite solo `.env.*.example`), `node_modules/`, caches Python, `.vscode/`, `.idea/`, etc.
- `.dockerignore` en raíz y `api/.dockerignore`.

### Cambiado
- Postgres del portal: 16 → **18-alpine** con mount `/var/lib/postgresql` (formato nuevo).
- Redis: 7 → **8-alpine**.
- Postgres CKAN permanece en 16 por compatibilidad con CKAN 2.11.

### Removido
- Carpeta `nginx/ssl/` y certificados self-signed (TLS lo maneja el gateway).
- Locations `/acervo/`, `/mapalab/`, `/geoserver/` del nginx local (gateway las rutea).
- Headers de seguridad (HSTS, X-Frame-Options, COOP, CSP) del nginx local.
- Rate limiting (`limit_req_zone`) del nginx local.
- Bind mounts en `docker-compose.yml`: `./api:/app` (debug en prod) y `../acervo/.../acervo.crt` (rompía portabilidad).
- Red `webnet` huérfana.
- `.env.development`, `api/.env`, `nginx/.env` destrackeados de git.

---

## [1.0.0] - 2024-11-04

Versión inicial del monorepo unificado.

### Agregado
- Sistema de autenticación OAuth2 + JWT con cookies httpOnly y CSRF.
- Gestión de usuarios con roles (`tetlamamakani`, `editora`).
- Sistema de páginas dinámicas con secciones y componentes.
- Gestión de menú jerárquico con drag & drop (`@dnd-kit`).
- Sistema genérico de borradores (`borradores/{resource_type}`).
- Historial de acciones y búsqueda global.
- CMS Admin con React 19 + Ant Design 6.
- Portal web público con React 19 + Tailwind 4.
- Backend FastAPI 0.111 + SQLAlchemy 2 + Alembic.
- Docker Compose con PostgreSQL 16, Redis 7.
