# Extiende la imagen oficial de CKAN
FROM ckan/ckan-base:2.10

# Cambiar a root para instalar dependencias del sistema
USER root

# Dependencias del sistema (si algún plugin las necesita)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Volver al usuario de CKAN
USER ckan

# ── Instalar plugins desde PyPI ──────────────────────────────
RUN pip install --no-cache-dir \
    ckanext-scheming \
    ckanext-pages \
    ckanext-pdfview \
    ckanext-harvest

# ── Copiar configuración personalizada ───────────────────────
COPY --chown=ckan:ckan production.ini ${APP_DIR}/production.ini

# ── Copiar plugins locales (si tienes alguno propio) ─────────
# COPY --chown=ckan:ckan plugins/mi-plugin ${APP_DIR}/mi-plugin
# RUN pip install -e ${APP_DIR}/mi-plugin

# ── Script de inicialización personalizado (opcional) ────────
COPY --chown=ckan:ckan docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]