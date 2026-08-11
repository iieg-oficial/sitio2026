"""
Parche aplicado durante el build de Docker sobre ckanext-s3filestore.

PROBLEMA:
    views/resource.py de s3filestore SIEMPRE llama a get_signed_url_to_key(),
    que genera URLs con X-Amz-* parámetros. Cuando el servidor S3/MinIO está
    detrás de un proxy Nginx, la firma es inválida porque fue calculada con
    el host interno pero la petición llega por el host público.

SOLUCIÓN:
    Reemplazamos resource_download() para que, cuando hay download_proxy
    configurado, construya la URL directamente sin pre-firmar.

    URL generada: {download_proxy}/{bucket}/{storage_path}/resources/{id}/{file}
    Ejemplo:      https://10.25.7.4/acervo/portal/datos-abiertos/resources/.../file.xlsx
"""
import os
import sys

S3FILESTORE_PATH = '/srv/app/src/ckanext-s3filestore/ckanext/s3filestore/views/resource.py'

PATCHED_CONTENT = '''# encoding: utf-8
# ============================================================================
# ARCHIVO PARCHEADO POR ckanext-iieg-theme durante el build de Docker.
# Motivo: el comportamiento original genera presigned URLs (X-Amz-*) que
# fallan cuando MinIO está detrás de un proxy Nginx, porque la firma se
# calcula con el host interno pero llega por el host público.
# ============================================================================
import os
import logging
import mimetypes

import flask

from botocore.exceptions import ClientError

from ckantoolkit import config as ckan_config
from ckantoolkit import _, request, c, g
import ckantoolkit as toolkit
import ckan.logic as logic
import ckan.lib.base as base
import ckan.lib.uploader as uploader
from ckan.lib.uploader import get_storage_path

import ckan.model as model

log = logging.getLogger(__name__)

Blueprint = flask.Blueprint
NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized
get_action = logic.get_action
abort = base.abort
redirect = toolkit.redirect_to


s3_resource = Blueprint(
    u\'s3_resource\',
    __name__,
    url_prefix=u\'/dataset/<id>/resource\',
    url_defaults={u\'package_type\': u\'dataset\'}
)


def resource_download(package_type, id, resource_id, filename=None):
    """
    Provee descarga redirigiendo al usuario a la URL del recurso almacenado
    o construyendo una URL directa via proxy para archivos subidos a S3.

    PARCHE IIEG: cuando hay download_proxy configurado, construye la URL
    directamente sin llamar a generate_presigned_url(), evitando así los
    parámetros X-Amz-* que invalidan la firma al pasar por Nginx.
    """
    context = {\'model\': model, \'session\': model.Session,
               \'user\': c.user or c.author, \'auth_user_obj\': c.userobj}

    try:
        rsc = get_action(\'resource_show\')(context, {\'id\': resource_id})
        get_action(\'package_show\')(context, {\'id\': id})
    except NotFound:
        return abort(404, _(\'Resource not found\'))
    except NotAuthorized:
        return abort(401, _(\'Unauthorized to read resource %s\') % id)

    if rsc.get(\'url_type\') == \'upload\':

        upload = uploader.get_resource_uploader(rsc)

        if filename is None:
            filename = os.path.basename(rsc[\'url\'])

        key_path = upload.get_path(rsc[\'id\'], filename)
        download_proxy = ckan_config.get(
            \'ckanext.s3filestore.download_proxy\', None)

        if download_proxy:
            # ── PARCHE IIEG: URL directa sin pre-firma ────────────────────────
            # Construimos la URL pública sin pasar por boto3.generate_presigned_url.
            # La URL resultante es accesible via Nginx que proxea al MinIO interno.
            #
            # Estructura: {download_proxy}/{bucket}/{key_path}
            #   key_path = {storage_path}/resources/{resource_id}/{filename}
            # ─────────────────────────────────────────────────────────────────
            bucket = ckan_config.get(
                \'ckanext.s3filestore.aws_bucket_name\', \'\')
            proxy = download_proxy.rstrip(\'/\')
            url = \'{}/{}/{}\'.format(proxy, bucket, key_path)
            log.info(\'[iieg-patch] Descarga directa via proxy: %s\', url)
            return redirect(url)

        # Sin proxy: comportamiento original con presigned URL
        preview = request.args.get(u\'preview\', False)

        try:
            if preview:
                url = upload.get_signed_url_to_key(key_path)
            else:
                params = {
                    \'ResponseContentDisposition\':
                        \'attachment; filename=\' + filename,
                }
                url = upload.get_signed_url_to_key(key_path, params)
            return redirect(url)

        except ClientError as ex:
            if ex.response[\'Error\'][\'Code\'] in [\'NoSuchKey\', \'404\']:
                if ckan_config.get(
                        \'ckanext.s3filestore.filesystem_download_fallback\',
                        False):
                    log.info(\'Attempting filesystem fallback for resource {0}\'
                             .format(resource_id))
                    url = toolkit.url_for(
                        u\'s3_resource.filesystem_resource_download\',
                        id=id,
                        resource_id=resource_id,
                        filename=filename,
                        preview=preview)
                    return redirect(url)

                return abort(404, _(\'Resource data not found\'))
            else:
                raise ex
    else:
        return redirect(rsc[u\'url\'])


def filesystem_resource_download(package_type, id, resource_id, filename=None):
    """
    A fallback view action to download resources from the filesystem.
    """
    context = {
        u\'model\': model,
        u\'session\': model.Session,
        u\'user\': g.user,
        u\'auth_user_obj\': g.userobj
    }
    preview = request.args.get(u\'preview\', False)

    try:
        rsc = get_action(u\'resource_show\')(context, {u\'id\': resource_id})
        get_action(u\'package_show\')(context, {u\'id\': id})
    except (NotFound, NotAuthorized):
        return abort(404, _(u\'Resource not found\'))

    mimetype, enc = mimetypes.guess_type(rsc.get(\'url\', \'\'))

    if rsc.get(u\'url_type\') == u\'upload\':
        path = get_storage_path()
        storage_path = os.path.join(path, \'resources\')
        directory = os.path.join(storage_path,
                                 resource_id[0:3], resource_id[3:6])
        filepath = os.path.join(directory, resource_id[6:])
        if preview:
            return flask.send_file(filepath, mimetype=mimetype)
        else:
            return flask.send_file(filepath)
    elif u\'url\' not in rsc:
        return abort(404, _(u\'No download is available\'))

    return redirect(rsc[u\'url\'])


s3_resource.add_url_rule(u\'/<resource_id>/download\',
                         view_func=resource_download)
s3_resource.add_url_rule(u\'/<resource_id>/download/<filename>\',
                         view_func=resource_download)
s3_resource.add_url_rule(u\'/<resource_id>/fs_download/<filename>\',
                         view_func=filesystem_resource_download)


def get_blueprints():
    return [s3_resource]
'''

if not os.path.exists(S3FILESTORE_PATH):
    print(f"ERROR: No se encontró {S3FILESTORE_PATH}", file=sys.stderr)
    sys.exit(1)

# Hacer backup del original
backup_path = S3FILESTORE_PATH + '.original'
if not os.path.exists(backup_path):
    with open(S3FILESTORE_PATH, 'r') as f:
        original = f.read()
    with open(backup_path, 'w') as f:
        f.write(original)
    print(f"Backup guardado en: {backup_path}")

# Escribir el archivo parcheado
with open(S3FILESTORE_PATH, 'w') as f:
    f.write(PATCHED_CONTENT)

print(f"✅ Parche aplicado exitosamente a: {S3FILESTORE_PATH}")
