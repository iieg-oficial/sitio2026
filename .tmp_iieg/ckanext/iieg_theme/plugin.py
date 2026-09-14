from ckan.plugins import toolkit

from ckan import plugins


class IiegThemePlugin(plugins.SingletonPlugin):
    """Plugin principal del tema IIEG para CKAN."""

    plugins.implements(plugins.IConfigurer)

    # IConfigurer -----------------------------------------------------------
    def update_config(self, config):
        """Registra las carpetas de templates, assets públicos y fanstatic."""
        toolkit.add_template_directory(config, 'templates')
        toolkit.add_public_directory(config, 'public')
        toolkit.add_resource('fanstatic', 'iieg_theme')
