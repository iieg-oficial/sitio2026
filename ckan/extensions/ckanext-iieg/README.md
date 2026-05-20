# ckanext-iieg

Extension base para el tema personalizado de CKAN del portal IIEG.

## Plugin

- `iieg`: plugin de tema que registra templates y archivos publicos.

## Comportamiento por defecto

- Esta extension no sobreescribe templates core de CKAN por defecto.
- CKAN mantiene su estructura visual original mientras no actives overrides.
- Los ejemplos de personalizacion estan en `ckanext/iieg/examples/overrides`.

## Helpers disponibles

- `h.iieg_site_title()`
	- Lee `ckanext.iieg.site_title` (por defecto `Portal IIEG`).
- `h.iieg_show_debug_badge()`
	- Lee `ckanext.iieg.show_debug_badge` (por defecto `False`).

## Activar personalizaciones solo cuando sea necesario

1. Copia el override que quieras activar desde `examples/overrides` hacia `templates`.
2. Reconstruye CKAN: `make build`.
3. Levanta servicios: `make up`.

Ejemplos:

- Home promoted:
	- de `ckanext/iieg/examples/overrides/home/snippets/promoted.html`
	- a `ckanext/iieg/templates/home/snippets/promoted.html`
- Carga global de CSS:
	- de `ckanext/iieg/examples/overrides/templates/base.html`
	- a `ckanext/iieg/templates/base.html`
- Overrides minimos de componentes CKAN:
	- ver `ckanext/iieg/examples/overrides/README.md`

## Desarrollo

Esta extension esta pensada para instalarse desde Docker durante el build del servicio `ckan`.
