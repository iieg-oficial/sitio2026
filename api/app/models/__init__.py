from app.core.database import Base
from app.models.borrador import Borrador
from app.models.media import Media, MediaFolder
from app.models.menu_item import MenuItem
from app.models.page import Page
from app.models.posts import Posts
from app.models.user import Usuario
from app.models.subject import Subject
from app.models.plaformas import Plataformas
from app.models.datos_nuevos import DatosNuevos
from app.models.flashes import Flashes
from app.models.mapa import Mapa
from app.models.valores import Valores
from app.models.normatividad import Normatividad
from app.models.plan_institucional import PlanInstitucional
from app.models.plan_trabajo import PlanTrabajo
from app.models.directorio import Directorio
from app.models.organos import Organos
from app.models.archivos import Archivos
from app.models.snieg import Snieg

__all__ = [
    "Base",
    "Usuario",
    "Page",
    "MenuItem",
    "Media",
    "MediaFolder",
    "Borrador",
    "Posts",
    "Subject",
    "Plataformas",
    "DatosNuevos",
    "Flashes",
    "Mapa",
    "Valores",
    "Normatividad",
    "PlanInstitucional",
    "PlanTrabajo",
    "Directorio",
    "Organos",
    "Archivos",
    "Snieg",
]
