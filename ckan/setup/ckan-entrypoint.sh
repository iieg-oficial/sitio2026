#!/bin/bash
set -e

# CKAN recibe las credenciales por separado para evitar que caracteres reservados
# de las contrasenas se interpreten como parte de la URL de PostgreSQL.
eval "$(python3 - <<'PY'
import os
import shlex
from urllib.parse import quote_plus

ckan_password = quote_plus(os.environ["CKAN_DB_PASSWORD"])
datastore_password = quote_plus(os.environ["DATASTORE_RO_PASSWORD"])
urls = {
	"CKAN_SQLALCHEMY_URL": f"postgresql://ckan:{ckan_password}@ckan-db:5432/ckan_default",
	"CKAN_DATASTORE_WRITE_URL": f"postgresql://ckan:{ckan_password}@ckan-db:5432/datastore_default",
	"CKAN_DATASTORE_READ_URL": f"postgresql://datastore_default:{datastore_password}@ckan-db:5432/datastore_default",
}
for name, value in urls.items():
	print(f"export {name}={shlex.quote(value)}")
PY
)"

# 1. Volcar las variables de entorno de Docker para el Cron
declare -p | grep -v -e BASH -e WINDOWS -e _= > /etc/environment

# 2. Arrancar el demonio de cron en segundo plano (como root)
echo "Iniciando servicio de Cron..."
service cron start

# 3. Ejecutar la inicialización oficial de la base de datos de CKAN
echo "Corriendo chequeos y migraciones (prerun)..."
python3 /srv/app/prerun.py

# 4. Arrancar CKAN con uWSGI (servidor de producción)
echo "Arrancando servidor web de CKAN..."
exec uwsgi \
  --http-socket 0.0.0.0:5000 \
  --wsgi-file /srv/app/wsgi.py --callable application \
  --master --enable-threads --lazy-apps --need-app \
  --processes 2 --threads 2 \
  --harakiri 60 --vacuum --die-on-term \
  --buffer-size 32768