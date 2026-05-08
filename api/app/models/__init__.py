from app.core.database import Base
from app.models.borrador import Borrador
from app.models.media import Media, MediaFolder
from app.models.menu_item import MenuItem
from app.models.page import Page
from app.models.posts import Posts
from app.models.user import Usuario
from app.models.subject import Subject
from app.models.datos_nuevos import DatosNuevos
from app.models.flashes import Flashes
from app.models.mapa import Mapa
from app.models.directorio import Directorio
from app.models.organos import Organos
from app.models.archivos import Archivos
from app.models.snieg import Snieg
from app.models.preguntas import Preguntas
from app.models.sistemas import Sistemas
from app.models.reportes import Reportes
from app.models.documentacion import Documentacion
from app.models.profesores import Profesores
from app.models.instituciones import Instituciones
from app.models.modulos import Modulos
from app.models.perfiles import Perfiles
from app.models.cursos import Cursos
from app.models.docs_iieg import DocsIIEG
from app.models.banner import Banner
from app.models.contacto import Contacto

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
    "DatosNuevos",
    "Flashes",
    "Mapa",
    "Directorio",
    "Organos",
    "Archivos",
    "Snieg",
    "Preguntas",
    "Sistemas",
    "Reportes",
    "Documentacion",
    "Profesores",
    "Instituciones",
    "Modulos",
    "Perfiles",
    "Cursos",
    "DocsIIEG",
    "Banner",
    "Contacto",
]
