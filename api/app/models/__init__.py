from app.core.database import Base
from app.models.archivos import Archivos
from app.models.banner import Banner
from app.models.borrador import Borrador
from app.models.contacto import Contacto
from app.models.cuadernillos import Cuadernillo
from app.models.cursos import Cursos
from app.models.datos_nuevos import DatosNuevos
from app.models.directorio import Directorio
from app.models.docs_iieg import DocsIIEG
from app.models.documentacion import Documentacion
from app.models.flashes import Flashes
from app.models.instituciones import Instituciones
from app.models.mapa import Mapa
from app.models.media import Media, MediaFolder
from app.models.menu_item import MenuItem
from app.models.modulos import Modulos
from app.models.organos import Organos
from app.models.page import Page
from app.models.perfiles import Perfiles
from app.models.posts import GalleryImage, Posts
from app.models.preguntas import Preguntas
from app.models.profesores import Profesores
from app.models.reportes import Reportes
from app.models.sistemas import Sistemas
from app.models.snieg import Snieg
from app.models.subject import Subject
from app.models.user import Usuario

__all__ = [
    "Base",
    "Usuario",
    "Page",
    "MenuItem",
    "Media",
    "MediaFolder",
    "Borrador",
    "GalleryImage",
    "Posts",
    "GalleryImage",
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
    "Cuadernillo",
]
