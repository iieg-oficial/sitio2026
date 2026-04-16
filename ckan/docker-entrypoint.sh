#!/bin/bash
set -e

echo ">>> Iniciando CKAN..."

# Esperar a que la base de datos esté lista
until pg_isready -h ckan-db -U ckan -d ckan 2>/dev/null; do
  echo ">>> Esperando base de datos..."
  sleep 3
done

# Inicializar o migrar la BD automáticamente
ckan db upgrade

# Inicializar Datastore (si usas el plugin)
# ckan datastore set-permissions | psql ...

echo ">>> CKAN listo!"

# Ejecutar el comando original de la imagen base
exec /srv/app/start_ckan.sh