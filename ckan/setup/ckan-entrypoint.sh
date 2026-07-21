#!/bin/bash
set -e

# 1. Volcar las variables de entorno de Docker para el Cron
declare -p | grep -v -e BASH -e WINDOWS -e _= > /etc/environment

# 2. Arrancar el demonio de cron en segundo plano (como root)
echo "Iniciando servicio de Cron..."
service cron start

# 3. Ejecutar la inicialización oficial de la base de datos de CKAN
echo "Corriendo chequeos y migraciones (prerun)..."
python3 /srv/app/prerun.py

# 4. Pasar el control al proceso original de CKAN (uWSGI)
echo "Arrancando servidor web de CKAN..."
# Usamos ckan-uwsgi que es el estándar de las imágenes 2.11 oficiales
exec ckan -c /srv/app/ckan.ini run -H 0.0.0.0 -p 5000