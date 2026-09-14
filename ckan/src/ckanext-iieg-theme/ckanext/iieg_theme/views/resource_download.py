"""
Vista de descarga de recursos S3 para el tema IIEG.

Problema que resuelve:
    El plugin ckanext-s3filestore genera URLs pre-firmadas (presigned URLs con
    parámetros X-Amz-*) al redirigir la descarga. Esas URLs fallan cuando el
    servidor MinIO está detrás de un proxy (Nginx), porque la firma se calcula
    con el host interno pero la petición llega por el host público, haciendo
    que MinIO rechace la firma.

Solución:
    Cuando está configurado un `download_proxy`, construimos la URL de descarga
    directamente —sin pre-firmar— usando la ruta pública del proxy. El archivo
    está disponible públicamente a través de Nginx, que lo proxea a MinIO sin
    necesidad de autenticación por firma.

    URL que construimos:
        {download_proxy}/{bucket}/{storage_path}/resources/{resource_id}/{filename}
    Ejemplo:
        https://10.25.7.4/acervo/portal/datos-abiertos/resources/<uuid>/<archivo>.xlsx
"""
import logging
import os

import ckantoolkit as toolkit
import flask
from ckan.lib import base, uploader
from ckantoolkit import _, c
from ckantoolkit import config as ckan_config

from ckan import logic, model

log = logging.getLogger(__name__)

Blueprint = flask.Blueprint
NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized
get_action = logic.get_action
abort = base.abort
redirect = toolkit.redirect_to


# Registramos el blueprint con el mismo prefijo que usa s3filestore,
# así Flask usa ESTE handler y no el del plugin base.
iieg_s3_resource = Blueprint(
    'iieg_s3_resource',
    __name__,
    url_prefix='/dataset/<id>/resource',
    url_defaults={'package_type': 'dataset'}
)


def resource_download(package_type, id, resource_id, filename=None):
    """
    Descarga un recurso redirigiendo al proxy público sin URL pre-firmada.

    Si hay download_proxy configurado, construye la URL limpia directamente.
    Si NO hay download_proxy, delega al comportamiento normal de s3filestore
    (genera presigned URL con la conexión interna S3).
    """
    context = {
        'model': model,
        'session': model.Session,
        'user': c.user or c.author,
        'auth_user_obj': c.userobj,
    }

    try:
        rsc = get_action('resource_show')(context, {'id': resource_id})
        get_action('package_show')(context, {'id': id})
    except NotFound:
        return abort(404, _('Resource not found'))
    except NotAuthorized:
        return abort(401, _('Unauthorized to read resource %s') % id)

    if rsc.get('url_type') == 'upload':
        upload = uploader.get_resource_uploader(rsc)

        if filename is None:
            filename = os.path.basename(rsc['url'])

        download_proxy = ckan_config.get(
            'ckanext.s3filestore.download_proxy', None)

        if download_proxy:
            # ─── SOLUCIÓN AL PROBLEMA DE PRESIGNED URLS ──────────────────────
            # Construimos la URL directa usando el proxy público, sin pasar
            # por boto3.generate_presigned_url() que añade parámetros X-Amz-*.
            #
            # Estructura de la clave en S3/MinIO (path-style):
            #   {host}/{bucket}/{storage_path}/resources/{resource_id}/{filename}
            #
            # Con download_proxy sustituimos {host}/{bucket}/ por el proxy:
            #   {download_proxy}/{storage_path}/resources/{resource_id}/{filename}
            #
            # Nota: upload.get_path() devuelve:
            #   {aws_storage_path}/resources/{resource_id}/{filename}
            # ─────────────────────────────────────────────────────────────────
            bucket = ckan_config.get(
                'ckanext.s3filestore.aws_bucket_name', '')
            key_path = upload.get_path(rsc['id'], filename)

            # Aseguramos que download_proxy no tenga / al final
            proxy = download_proxy.rstrip('/')

            # La URL pública final: proxy + / + bucket + / + key_path
            url = f'{proxy}/{bucket}/{key_path}'

            log.debug(
                'IIEG resource download (direct proxy URL): %s', url)
            return redirect(url)

        else:
            # Sin proxy configurado: delegamos al comportamiento original de
            # s3filestore que genera una presigned URL con acceso directo a S3.
            # Esto solo ocurre en entornos de desarrollo con S3 accesible.
            try:
                params = {
                    'ResponseContentDisposition':
                        'attachment; filename=' + filename,
                }
                url = upload.get_signed_url_to_key(
                    upload.get_path(rsc['id'], filename), params)
                return redirect(url)
            except Exception as e: # noqa: BLE001
                log.error(
                    'Error generando presigned URL para recurso %s: %s', rsc['id'], e
                )
                return abort(500, _('Error al generar la URL de descarga'))

    else:
        # Recurso de tipo enlace (no upload): redirigir a la URL almacenada.
        return redirect(rsc['url'])


# Registramos las mismas rutas que s3filestore para sobrescribirlas.
iieg_s3_resource.add_url_rule(
    '/<resource_id>/download',
    view_func=resource_download)
iieg_s3_resource.add_url_rule(
    '/<resource_id>/download/<filename>',
    view_func=resource_download)


def get_blueprints():
    return [iieg_s3_resource]
