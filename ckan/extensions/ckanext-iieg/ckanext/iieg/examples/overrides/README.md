# Overrides Minimos de Ejemplo

Estos archivos son ejemplos para personalizar CKAN con cambios minimos.
No se aplican automaticamente.

## Uso

1. Copia solo el archivo que quieras activar desde `examples/overrides/templates/...` a `templates/...`.
2. Reconstruye: `make build`.
3. Reinicia servicios: `make up`.

## Componentes incluidos

- Header: `templates/header.html`
- Footer: `templates/footer.html`
- Home: `templates/home/index.html`
- Busqueda de datasets: `templates/package/search.html`
- Detalle de dataset: `templates/package/read.html`
- Listado de organizaciones: `templates/organization/index.html`
- Listado de grupos: `templates/group/index.html`
- Perfil de usuario: `templates/user/read.html`
