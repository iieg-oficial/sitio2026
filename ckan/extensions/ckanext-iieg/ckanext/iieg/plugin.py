import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import config


class IIEGThemePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)

    def update_config(self, config_):
        # Keep CKAN defaults untouched; only provide extension resources.
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "iieg")

    def get_helpers(self):
        return {
            "iieg_site_title": self._site_title,
            "iieg_show_debug_badge": self._show_debug_badge,
        }

    def _site_title(self):
        return config.get("ckanext.iieg.site_title", "Portal IIEG")

    def _show_debug_badge(self):
        return toolkit.asbool(config.get("ckanext.iieg.show_debug_badge", False))
