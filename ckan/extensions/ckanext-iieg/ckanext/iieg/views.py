from flask import Blueprint
from ckan.plugins import toolkit

# 1. Creamos el Blueprint de Flask
iieg_blueprint = Blueprint('iieg', __name__)

# 2. Definimos la función y la URL (ruta)
@iieg_blueprint.route('/privacidad')
def privacidad_page():
    # toolkit.render se encarga de buscar la plantilla en tu carpeta de templates
    return toolkit.render('pages/privacy.html')

@iieg_blueprint.route('/terminos')
def terminos_page():
    return toolkit.render('pages/terms.html')