# Portal IIEG

<div align="center">

![Version](https://img.shields.io/badge/version-1.9.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![CKAN](https://img.shields.io/badge/CKAN-2.11.5-7B7B7B?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

**Portal del Instituto de Información Estadística y Geográfica de Jalisco**

Historial de cambios en [CHANGELOG.md](./CHANGELOG.md).

</div>

## Componentes

| Componente | Stack | Notas |
|---|---|---|
| **web** | React 19 + Vite 7 + Tailwind 4 | Portal público |
| **admin** | React 19 + Vite 7 + Ant Design 6 | CMS (`/portal-admin`) |
| **api** | FastAPI 0.111 + SQLAlchemy 2 + boto3 | Backend |
| **ckan** | CKAN 2.11.5 + xloader + s3filestore | Datos abiertos (`/datos-abiertos`) |
| **nginx** | Alpine | Reverse proxy |
| **seaweedfs** | SeaweedFS 4.23 | Acervo S3 (solo dev embebido) |

## Inicio rápido

```bash
git clone <repo> sitio2026 && cd sitio2026
make setup        # crea .env.development y .env.production desde los .example
# (edita .env.development con tus secretos)
make up           # arranca dev local
```

Acceso:
- Portal web: http://localhost:18080
- CMS admin: http://localhost:18080/portal-admin
- CKAN: http://localhost:18080/datos-abiertos/

Detalle de URLs, puertos y credenciales por defecto en [docs/ambientes.md](./docs/ambientes.md).

## Comandos

```bash
make up [ENV=dev|prod|gcp]   # arranca
make build                    # rebuild + arranca
make down                     # detiene
make logs                     # tail logs
make restart                  # down + up
make clean                    # borra volúmenes de los 3 modos (pide confirmación)
make shell-api                # bash en api
make shell-ckan               # bash en ckan
make shell-web                # sh en web (solo dev)
make shell-admin              # sh en admin (solo dev)
```

## Documentación

| Documento | Descripción |
|---|---|
| [Ambientes](./docs/ambientes.md) | Levantar dev / prod / gcp, URLs, troubleshooting |
| [Infraestructura](./docs/infraestructura.md) | Stack, arquitectura, redes Docker, convenciones |
| [Media y Acervo](./docs/media_acervo.md) | Cómo subir/leer archivos al S3, MediaSelector, buckets |
| [Flow de componente](./docs/flow_componente.md) | Crear un componente end-to-end (DB → API → CMS → web) |
| [Drafts](./docs/drafts.md) | Sistema de borradores genérico |
| [Importacion](./docs/importacion_masiva.md) | Guía de importacion mediante seeds |
| [Migracion servidor](./docs/migracion_servidor_final.md) | Formas para migrar de proxmos a servidor final |
| [Contribución](./CONTRIBUTING.md) | Guía para contribuidores |

## Licencia

[MIT](./LICENSE) - Instituto de Información Estadística y Geográfica de Jalisco
