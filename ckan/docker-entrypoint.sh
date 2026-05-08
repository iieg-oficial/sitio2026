#!/bin/bash
set -e

echo ">>> Iniciando CKAN..."

# Esperar a que la base de datos esté lista
until pg_isready -h ckan-db -U ckan -d ckan 2>/dev/null; do
  echo ">>> Esperando base de datos..."
  sleep 3
done

# Generar secrets si es necesario
if grep -qE "beaker.session.secret ?= ?$" /srv/app/ckan.ini; then
    echo "Setting beaker.session.secret in ini file"
    ckan config-tool /srv/app/ckan.ini "beaker.session.secret=$(python3 -c 'import secrets; print(secrets.token_urlsafe())')"
    ckan config-tool /srv/app/ckan.ini "WTF_CSRF_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe())')"
    JWT_SECRET=$(python3 -c 'import secrets; print("string:" + secrets.token_urlsafe())')
    ckan config-tool /srv/app/ckan.ini "api_token.jwt.encode.secret=${JWT_SECRET}"
    ckan config-tool /srv/app/ckan.ini "api_token.jwt.decode.secret=${JWT_SECRET}"
    ckan config-tool /srv/app/ckan.ini "SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe())')"
fi

# Inicializar o migrar la BD automáticamente
ckan db upgrade

# Inicializar Datastore (si usas el plugin)
# ckan datastore set-permissions | psql ...

echo ">>> CKAN listo!"

# Iniciar servidor de desarrollo de CKAN
exec ckan -c /srv/app/ckan.ini run --host 0.0.0.0 --port 5000