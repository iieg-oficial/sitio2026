# Guía de Contribución

¡Gracias por tu interés en contribuir al Portal IIEG! Antes de empezar, asegúrate de leer los siguientes documentos:

- **[docs/AMBIENTES.md](./docs/AMBIENTES.md)** — cómo levantar dev/prod localmente
- **[docs/INFRAESTRUCTURA.md](./docs/INFRAESTRUCTURA.md)** — stack, redes, arquitectura
- **[docs/FLOW_COMPONENTE.md](./docs/FLOW_COMPONENTE.md)** — crear un componente end-to-end
- **[docs/MEDIA_ACERVO.md](./docs/MEDIA_ACERVO.md)** — subir/listar archivos al S3
- **[docs/DRAFTS.md](./docs/DRAFTS.md)** — sistema de borradores

## Setup

```bash
git clone <repo> sitio2026 && cd sitio2026
make setup    # crea .env.development y .env.production con secretos generados
make up       # levanta dev local (incluye acervo embebido)
```

> URLs y credenciales por defecto: [docs/AMBIENTES.md](./docs/AMBIENTES.md).

Prerrequisitos: Docker + Docker Compose, `make`, `openssl` (para secretos).

## Branching

- `main` — código listo para producción
- `develop` — rama principal de desarrollo
- `epic/<nombre>` — épicas grandes
- `feature/<nombre>` — features
- `fix/<nombre>` — bugs

## Workflow

1. Crear issue o sumarte a una épica activa
2. Rama desde `develop` (`feature/` o `fix/`)
3. Implementar siguiendo las convenciones
4. Commits con [Conventional Commits](https://www.conventionalcommits.org/)
5. PR contra `develop`

## Convenciones de código

### Backend (Python — `api/`)

- PEP 8
- Type hints requeridos
- `snake_case` funciones y variables, `PascalCase` clases
- Lint: `ruff check` y `ruff format`
- Endpoints en **español** (`autenticacion`, `multimedia`, `elementos-menu`, etc.)
- Métodos mutables protegidos con `verify_csrf`

### Frontend (JS/JSX — `web/` y `admin/`)

- ESLint: **4 espacios** de indent, **comillas simples**
- Componentes: `PascalCase`. Funciones/vars: `camelCase`
- Usar siempre los **alias de Vite** (`@components`, `@pages`, `@services`, etc.)
- **Tailwind only** en `web/` (sin dark mode). **Ant Design** en `admin/`
- Lint: `npm run lint`

### Reglas generales

- Reutilizar componentes/hooks/helpers/servicios existentes antes de crear nuevos
- Evitar comentarios que solo describan *qué* hace el código; añadirlos cuando expliquen un *por qué* no evidente
- Evitar crear markdowns explicando actividades a menos que se solicite
- Conventional commits sin referencias a agentes

## Commits

```
tipo(scope): descripción corta

Body opcional con el "por qué".
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`.

Ejemplos:
```
feat(media): agregar selector de bucket portal/iieg
fix(ckan): corregir 404 alternante por DNS colision en iieg-network
docs(ambientes): documentar troubleshooting de puertos ocupados
```

## Pull Requests

Antes de abrir un PR:

- [ ] `make build && make logs` corre sin errores
- [ ] Lint pasa (`ruff check api/` y `npm run lint` en web/ y admin/)
- [ ] Tests pasan si hay (`pytest` en api/)
- [ ] Documentación actualizada si tocaste algo de los docs
- [ ] `.env.*.example` actualizado si agregaste/quitaste vars
- [ ] No hay secretos commiteados (`.env` reales están gitignored)

Template del PR:

```markdown
## Resumen
Qué cambia y por qué.

## Cómo probarlo
Pasos concretos.

## Checklist
- [ ] Lint OK
- [ ] Probado en dev (`make up`)
- [ ] Probado en prod local (`make up ENV=gcp`) si aplica
- [ ] Docs actualizados
```

## Seguridad

Ver [SECURITY.md](./SECURITY.md). Si encuentras una vulnerabilidad, te pedimos reportarla por canal privado en lugar de un issue público — ahí están los detalles.

---

¡Gracias por contribuir! Cualquier duda, abre un issue o pregunta en el equipo.
