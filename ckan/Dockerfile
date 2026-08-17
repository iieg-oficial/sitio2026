ARG CKAN_BASE_IMAGE=ckan/ckan-base:2.11.5
FROM ${CKAN_BASE_IMAGE}

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends git cron && \
    rm -rf /var/lib/apt/lists/*

RUN cd /srv/app/src && \
    git clone --depth 1 -b 2.3.0 https://github.com/ckan/ckanext-xloader.git && \
    pip install --no-cache-dir -e ckanext-xloader && \
    pip install --no-cache-dir -r ckanext-xloader/requirements.txt && \
    git clone --depth 1 https://github.com/keitaroinc/ckanext-s3filestore.git && \
    pip install --no-cache-dir -e ckanext-s3filestore && \
    pip install --no-cache-dir -r ckanext-s3filestore/requirements.txt

RUN pip install --no-cache-dir cookiecutter flask-debugtoolbar

# Tema personalizado IIEG
COPY --chown=ckan:ckan src/ckanext-iieg-theme /srv/app/src/ckanext-iieg-theme
RUN pip install --no-cache-dir -e /srv/app/src/ckanext-iieg-theme

# Parche sobre s3filestore: reemplaza el view de descarga para usar URLs
# directas via proxy en lugar de presigned URLs con parámetros X-Amz-*.
# Esto resuelve el problema de firma inválida cuando MinIO está detrás de Nginx.
COPY --chown=root:root setup/patch_s3filestore.py /tmp/patch_s3filestore.py
RUN python3 /tmp/patch_s3filestore.py && rm /tmp/patch_s3filestore.py

# Configurar cron para CKAN tracking update
# NOTA: Usamos el wrapper 'ckan-paster' o el binario del entorno virtual directo de la imagen base corporativa.
# Habitualmente en ckan-base el path correcto del entorno virtual es /usr/lib/ckan/default/bin/ckan o simplemente 'ckan' si se cargan las variables.
RUN echo "0 14 */3 * * root /usr/local/bin/ckan -c /srv/app/ckan.ini tracking update >> /var/log/ckan-tracking.log 2>&1" > /etc/cron.d/ckan-tracking && \
    chmod 0644 /etc/cron.d/ckan-tracking && \
    crontab /etc/cron.d/ckan-tracking && \
    touch /var/log/ckan-tracking.log && \
    chmod 666 /var/log/ckan-tracking.log

# Cambia la línea 33 por esta:
RUN chown -R 900:900 /srv/app && chown 900:900 /var/log/ckan-tracking.log

# Copiar entrypoint personalizado
COPY --chown=root:root setup/ckan-entrypoint.sh /srv/app/ckan-entrypoint.sh
RUN chmod +x /srv/app/ckan-entrypoint.sh

# 🔴 EL CAMBIO CLAVE: Mantenemos el usuario ROOT para el Entrypoint
# De esta manera el entrypoint puede levantar el servicio de cron.
# Dentro del script haremos el cambio al usuario 'ckan' para la web de forma segura.
USER root

ENTRYPOINT ["/srv/app/ckan-entrypoint.sh"]