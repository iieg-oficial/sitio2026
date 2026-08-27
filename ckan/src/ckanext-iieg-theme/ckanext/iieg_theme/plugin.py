# encoding: utf-8
from __future__ import annotations

from typing import Any, Callable
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import CKANConfig, config
from ckan.config.declaration import Declaration, Key

# === ESTOS DOS IMPORTS SON CRUCIALES PARA TU FUNCIÓN DE IMAGEN ===
import ckan.model as model
import ckan.lib.helpers as h

def show_most_popular_groups():
    '''Return the value of the most_popular_groups config setting.

    To enable showing the most popular groups, add this line to the
    [app:main] section of your CKAN config file::

      ckan.example_theme.show_most_popular_groups = True

    Returns ``False`` by default, if the setting is not in the config file.

    :rtype: bool

    '''
    value = config.get('ckan.iieg_theme.show_most_popular_groups')
    return value

def most_popular_groups():
    '''Return a sorted list of the groups with the most datasets.'''

    # Get a list of all the site's groups from CKAN, sorted by number of
    # datasets.
    groups = toolkit.get_action('group_list')(
        {}, {'sort': 'package_count desc', 'all_fields': True})

    # Truncate the list to the 10 most popular groups only.
    groups = groups[:10]

    return groups


def get_entity_image_url(entity_name: str, entity_type: str = 'organization') -> str:
    '''Devuelve la image_display_url de una organizacion o grupo por su nombre.'''
    try:
        entity_type_clean = 'organization' if 'organization' in entity_type else 'group'
        action = 'organization_show' if entity_type_clean == 'organization' else 'group_show'
        
        result = toolkit.get_action(action)(
            {'ignore_auth': True},
            {'id': entity_name, 'include_datasets': False}
        )
        
        image_url = result.get('image_url', '')
        
        # Si no hay absolutamente nada en el campo, no hay imagen
        if not image_url:
            return ''
            
        image_url = image_url.strip()
        
        # VALIDACIÓN SEGURA: 
        # Si el campo contiene un string vacío, marcadores comunes o rutas base del core, es falso.
        if image_url in ['', 'None', 'placeholder.png']:
            return ''
            
        # Si la URL generada apunta a los componentes estáticos predeterminados de CKAN
        display_url = result.get('image_display_url', '')
        if 'base/images/placeholder' in display_url or 'vendor/base' in display_url:
            return ''
            
        return display_url or image_url
    except Exception:
        return ''


def get_all_groups_list():
    '''Devuelve una lista con todos los grupos de CKAN incluyendo todos sus campos.'''
    try:
        # Llamamos a group_list pidiendo todos los campos (all_fields=True) 
        # para que incluya la información de image_url e image_display_url
        groups = toolkit.get_action('group_list')(
            {'ignore_auth': True},
            {'all_fields': True, 'sort': 'title asc'}
        )
        return groups
    except Exception:
        return []

def get_localized_current_url(locale: str) -> str:
    '''Generates the current URL with a new locale safely, without Jinja2 **kwargs issues.'''
    try:
        from flask import request
        endpoint = request.endpoint
        if not endpoint:
            # Fallback for non-flask or outside request context
            return toolkit.url_for(toolkit.h.current_url(), locale=locale)
            
        args = dict(request.view_args or {})
        # Actualizamos o añadimos el locale
        args['locale'] = locale
        
        # Generamos la nueva URL
        return toolkit.url_for(endpoint, **args)
    except Exception:
        # Fallback de seguridad
        try:
            return toolkit.url_for(toolkit.h.current_url(), locale=locale)
        except Exception:
            return ''
    
class IiegThemePlugin(plugins.SingletonPlugin):
    """Plugin principal del tema IIEG para CKAN."""

    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IConfigDeclaration)
    plugins.implements(plugins.IConfigurable)  # Para parchear s3filestore al arrancar
    plugins.implements(plugins.ITranslation)

    # Declare that this plugin will implement ITemplateHelpers.
    plugins.implements(plugins.ITemplateHelpers)

    # IConfigurer -----------------------------------------------------------
    def update_config(self, config: CKANConfig):

        """Registra las carpetas de templates, assets públicos y fanstatic."""
        toolkit.add_template_directory(config, 'templates')
        toolkit.add_public_directory(config, 'public')
        toolkit.add_resource('fanstatic', 'iieg_theme')

    # ITemplateHelpers ------------------------------------------------------
    def get_helpers(self) -> dict[str, Callable[..., Any]]:
        '''Register the most_popular_groups() function above as a template
        helper function.

        '''
        # Template helper function names should begin with the name of the
        # extension they belong to, to avoid clashing with functions from
        # other extensions.
        return {'iieg_theme_most_popular_groups': most_popular_groups,
                'iieg_theme_show_most_popular_groups': show_most_popular_groups,
                'iieg_theme_get_entity_image': get_entity_image_url,
                'get_iieg_group_image': self._get_group_image_by_package,
                'iieg_theme_all_groups': get_all_groups_list,
                'iieg_theme_get_localized_url': get_localized_current_url,
                'total_datasets': self._obtener_total_datasets,
                'recently_changed_packages': self._obtener_datasets_recientes,
                'recently_changed_packages_activity_stream': self._obtener_activity_reciente,
                'iieg_datasets_populares': self._obtener_datasets_populares
                }
    
    def _obtener_total_datasets(self):
        try:
            # Llamada segura a la API interna de CKAN
            result = toolkit.get_action('package_search')({}, {'q': '*:*', 'rows': 0})
            return result['count']
        except Exception:
            return 0

    def _obtener_datasets_recientes(self, limite=15):
        """Devuelve paquetes ordenados por metadata_modified desc.

        Esta versión no depende de ckanext-activity para la home del sitio.
        """
        try:
            limit = max(1, int(limite))
            result = toolkit.get_action('package_search')(
                {'ignore_auth': True},
                {'q': '*:*', 'sort': 'metadata_modified desc', 'rows': limit, 'include_private': False}
            )
            return result.get('results', [])
        except Exception:
            return []

    def _obtener_activity_reciente(self, limit=10):
        """Emula el formato básico del stream de actividad para Jinja.

        El tema espera objetos con .data.package y .timestamp; aquí los
        construimos a partir de los paquetes recientes para no depender de
        ckanext-activity.
        """
        try:
            limit = max(1, int(limit))
            packages = self._obtener_datasets_recientes(limit)
            activities = []
            for pkg in packages:
                timestamp = pkg.get('metadata_modified') or pkg.get('metadata_created')
                activities.append({
                    'timestamp': timestamp,
                    'data': {'package': pkg},
                })
            return activities
        except Exception:
            return []

    def _obtener_datasets_populares(self, limite=5):
        try:
            context = {'ignore_auth': True}
            data_dict = {
                'q': '*:*', 
                'sort': 'views_total desc', 
                'rows': int(limite)
            }
            result = toolkit.get_action('package_search')(context, data_dict)
            return result.get('results', [])
        except Exception:
            return []

    # IConfigurable ----------------------------------------------------------

    def configure(self, config_):
        """Parchea get_signed_url_to_key de s3filestore para construir URLs
        directas (sin parámetros X-Amz-*) cuando hay download_proxy configurado.

        PROBLEMA ORIGINAL:
            s3filestore llama a boto3.generate_presigned_url() → genera URL con
            X-Amz-Signature calculada con el host INTERNO (10.0.0.2:8333).
            Luego reemplaza solo el host por el download_proxy, pero deja los
            parámetros X-Amz-* intactos. MinIO rechaza la descarga porque la
            firma no corresponde al host que recibio la petición.

        SOLUCIÓN:
            Cuando hay download_proxy configurado, construimos la URL directamente:
                {download_proxy}/{bucket}/{key_path}
            Sin firmar, sin parámetros X-Amz-*. Nginx lo proxea a MinIO
            sin necesidad de autenticación por firma.
        """
        try:
            from ckanext.s3filestore.uploader import BaseS3Uploader
            import logging
            import os
            log = logging.getLogger(__name__)

            _original_get_signed_url = BaseS3Uploader.get_signed_url_to_key

            def _patched_get_signed_url(self_uploader, key, extra_params=None):
                """URL directa via proxy si está configurado, presigned si no."""
                if extra_params is None:
                    extra_params = {}

                if self_uploader.download_proxy:
                    # Construir URL limpia sin pre-firma:
                    # {download_proxy}/{bucket}/{key_path}
                    proxy = self_uploader.download_proxy.rstrip('/')
                    url = '{}/{}/{}'.format(
                        proxy,
                        self_uploader.bucket_name,
                        key
                    )
                    log.debug(
                        '[iieg_theme] URL de descarga directa (sin presign): %s',
                        url
                    )
                    return url

                # Sin proxy: comportamiento original (presigned URL)
                return _original_get_signed_url(self_uploader, key, extra_params)

            BaseS3Uploader.get_signed_url_to_key = _patched_get_signed_url
            log.info(
                '[iieg_theme] Parche aplicado a s3filestore: '
                'get_signed_url_to_key usará URL directa cuando hay download_proxy'
            )

        except ImportError:
            # s3filestore no está instalado — no hay nada que parchear
            pass


    # IConfigDeclaration

    def declare_config_options(self, declaration: Declaration, key: Key):
        declaration.declare_bool(
            key.ckan.iieg_theme.show_most_popular_groups)

    # ITranslation
    def i18n_directory(self):
        import os
        return os.path.join(os.path.dirname(__file__), 'i18n')

    def i18n_domain(self):
        return 'ckanext-iieg_theme'

    def i18n_locales(self):
        return ['en', 'es']

    def show_most_popular_groups():
        '''Return the value of the most_popular_groups config setting.

        To enable showing the most popular groups, add this line to the
        [app:main] section of your CKAN config file::

        ckan.example_theme.show_most_popular_groups = True

        Returns ``False`` by default, if the setting is not in the config file.

        :rtype: bool

        '''
        value = config.get('ckan.iieg_theme.show_most_popular_groups')
        return value
    
    def _get_group_image_by_package(self, package_id_or_name):
        """
        Busca de forma segura el primer grupo de un dataset y retorna su URL de imagen.
        """
        if not package_id_or_name:
            return None
            
        try:
            # Buscamos el paquete directamente en la Base de Datos para asegurar datos reales actuales
            pkg = model.Package.get(package_id_or_name)
            if pkg and pkg.groups:
                # Tomamos el primer grupo real asociado
                first_group = pkg.groups[0]
                
                # Si el grupo de la BD tiene configurada una URL de imagen
                if first_group.image_url:
                    # Construimos y retornamos la URL final resuelta de forma estática o externa
                    return h.url_for_static_or_external(first_group.image_url)
        except Exception:
            pass
            
        return None
    