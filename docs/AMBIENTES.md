# Ambientes y comandos

Tres modos. Todos se manejan con `make` desde la raíz del repo.

| ENV | Compose | env file | Descripción |
|---|---|---|---|
| `dev` (default) | `docker-compose.dev.yml` | `.env.development` | Local. Incluye `seaweedfs` embebido. Hot-reload de web/admin. |
| `prod` | `docker-compose.yml` | `.env.production` | Producción "administración": servidor aislado, Acervo accedido por URL pública. |
| `gcp` | `docker-compose.yml` + `docker-compose.gcp.yml` | `.env.production` | Producción GCP: todo en una VM. Conecta al Acervo via red Docker `iieg-network`. Útil también para testear local. |

## Setup inicial

```bash
git clone <repo> sitio2026 && cd sitio2026
make setup   # crea .env.development y .env.production desde sus .example
```

Edita `.env.development` y/o `.env.production` con los secretos reales (passwords, credenciales del Acervo, etc.). Los `.example` solo tienen placeholders `<...>`.

> Genera secretos así: `openssl rand -hex 32`

## Comandos

```bash
make up              # arranca dev (default)
make up ENV=prod     # producción administración (acervo externo via URL)
make up ENV=gcp      # producción GCP (acervo via iieg-network)

make build           # rebuild + up
make down            # detiene contenedores del ENV actual
make logs            # tail logs
make restart         # down + up

make clean           # borra contenedores Y volúmenes de los 3 modos (pide confirmación)

make shell-api       # bash en el container api
make shell-ckan      # bash en el container ckan
make shell-web       # sh en web (solo dev)
make shell-admin     # sh en admin (solo dev)
```

## URLs

Todas vía nginx en el puerto `NGINX_PORT` de tu `.env` (default `18080`):

| Servicio | URL |
|---|---|
| Portal web | http://localhost:18080 |
| CMS admin | http://localhost:18080/portal-admin |
| API portal | http://localhost:18080/api/portal/... |
| API admin | http://localhost:18080/api/portal-admin/... |
| CKAN | http://localhost:18080/datos-abiertos/ |

**Solo en dev** también hay puertos directos (sin nginx):

| Servicio | URL directa | Para qué |
|---|---|---|
| Vite web | http://localhost:13010 | Hot-reload del portal |
| Vite admin | http://localhost:13011 | Hot-reload del CMS |
| API | http://localhost:18000 | Tests directos, Swagger en `/docs` |
| CKAN | http://localhost:15000 | Tests directos sin prefijo |
| Postgres portal | localhost:15432 | DBeaver/psql |
| Postgres CKAN | localhost:15433 | DBeaver/psql |
| Redis | localhost:16379 | redis-cli |
| Solr | http://localhost:18983 | Inspección |
| SeaweedFS S3 | http://localhost:18333 | Cliente S3 directo |

## Credenciales por defecto

| App | Usuario | Password |
|---|---|---|
| Portal admin (CMS) | `admin` | `admin123` (en `.env`) |
| CKAN sysadmin | `ckan_admin` | `admin12345` (en `.env`) |
| SeaweedFS admin (dev) | `acervo-admin` | en `.env.development` |

Cambia las passwords en tu `.env` antes de cualquier deploy real.

## Tras el primer arranque

CKAN tarda ~1 min en el primer `up` (init de DB + Solr + setup admin + permisos datastore). Sigue los logs:

```bash
make logs ENV=dev
# o solo CKAN:
docker logs -f portal-ckan-dev
```

## Resetear estado

```bash
# borra solo dev
docker compose --env-file .env.development -f docker-compose.dev.yml down -v

# borra TODO (3 modos)
make clean
```

## Cambiar puertos si chocan

Si `:18080` u otro está ocupado por otro proyecto, edita el `.env`:

```bash
NGINX_PORT=28080
POSTGRES_PORT=25432
# etc.
```

Las URLs en `VITE_*_API_URL`, `CKAN_SITE_URL` y `CKAN_DOWNLOAD_PROXY` también deben actualizarse al mismo `NGINX_PORT`.

## Producción real (admin / GCP)

Para deploy real (no local):

1. **Edita `.env.production`** con valores reales:
   - Genera nuevos `SECRET_KEY`, `CSRF_SECRET_KEY`, `CKAN_BEAKER_SESSION_SECRET`, `CKAN_API_TOKEN_JWT_SECRET` con `openssl rand -hex 32`.
   - Cambia passwords de postgres, CKAN y admin del portal.
   - `ACERVO_*` apuntando al Acervo real (URL pública o hostname interno según topología).
   - `CKAN_SITE_URL`, `CKAN_DOWNLOAD_PROXY`, `VITE_*_API_URL`, `CORS_ORIGINS` con el dominio real.
   - `COOKIE_SECURE=true`, `COOKIE_DOMAIN=.dominio.com`, `ACERVO_USE_SSL=true`, `ACERVO_VERIFY_SSL=true`.

2. **Modo "administración" (servidor aislado del Acervo):**
   ```bash
   make up ENV=prod
   ```
   El Acervo se accede vía URL pública del gateway.

3. **Modo "GCP" (mismo VM que Acervo):**
   ```bash
   make up ENV=gcp
   ```
   El Acervo se accede vía la red Docker `iieg-network` (debe estar creada y compartida).

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| `failed to set up container networking: Bind for 0.0.0.0:XXXX failed: port is already allocated` | Otro proyecto usa ese puerto | Cambia el puerto correspondiente en `.env` |
| `405 Method Not Allowed` al hacer login en CKAN | Browser tiene HSTS de otro proyecto en `localhost` | Borra HSTS en `chrome://net-internals/#hsts` o usa `127.0.0.1` |
| `404` alternante en api/admin | DNS de docker resolviendo `api` a otro contenedor de otro proyecto en `iieg-network` | Verificar que `docker-compose.gcp.yml` tenga aliases `portal-api`, `portal-ckan` |
| 401 al hacer login en CKAN | Password mal | Reset: `docker exec portal-ckan python -c "import ckan.model as m; from ckan.cli import CKANConfigLoader; from ckan.config.environment import load_environment; load_environment(CKANConfigLoader('/srv/app/ckan.ini').get_config()); u=m.User.by_name('ckan_admin'); u._set_password('NUEVA_PASS'); m.repo.commit_and_remove()"` |
| `Acceso restringido` al subir archivos al Acervo | El servicio `seaweedfs` (dev) o el Acervo externo no responde | `docker logs portal-seaweedfs-dev` o verificar que `iieg-network` exista |
| `Plugin not found` al iniciar CKAN | Falta el plugin en el Dockerfile custom | Editar `ckan/Dockerfile` para instalar la extension |
