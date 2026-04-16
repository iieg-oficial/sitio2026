# Extiende la imagen oficial de CKAN
FROM ckan/ckan-base:2.10

# Cambiar a root para instalar dependencias del sistema
USER root

# Dependencias del sistema (si algún plugin las necesita)
RUN apk add --no-cache \
    postgresql-dev \
    postgresql-client \
    gcc \
    musl-dev \
    git

# Volver al usuario de CKAN
USER ckan

# ── Instalar plugins desde PyPI ──────────────────────────────
RUN pip install --no-cache-dir \
    ckanext-scheming \
    ckanext-pdfview \
    git+https://github.com/ckan/ckanext-pages.git \
    git+https://github.com/ckan/ckanext-harvest.git

# ── Copiar configuración personalizada ───────────────────────
COPY --chown=ckan:ckan production.ini ${APP_DIR}/ckan.ini

# ── Copiar plugins locales (si tienes alguno propio) ─────────
# COPY --chown=ckan:ckan plugins/mi-plugin ${APP_DIR}/mi-plugin
# RUN pip install -e ${APP_DIR}/mi-plugin

# ── Script de inicialización personalizado (opcional) ────────
COPY --chown=ckan:ckan docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]