# pyrefly: ignore [missing-import]
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import config
from ckanext.iieg.views import iieg_blueprint

class IIEGThemePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.ITranslation)
    plugins.implements(plugins.IBlueprint)

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

    def i18n_directory(self):
        return "i18n"

    def i18n_domain(self):
        return "ckanext-iieg"

    def _site_title(self):
        return config.get("ckanext.iieg.site_title", "Portal IIEG")

    def _show_debug_badge(self):
        return toolkit.asbool(config.get("ckanext.iieg.show_debug_badge", False))

    def get_blueprint(self):
        return iieg_blueprint