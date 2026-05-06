from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemResponse,
    MenuItemTree,
    MenuItemUpdate,
)
from app.schemas.page import PageCreate, PageResponse, PageUpdate
from app.schemas.user import LoginRequest, LoginResponse, UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.schemas.posts import PostCreate, PostOut, PostResponse
from app.schemas.subject import SubjectCreate, SubjectOut, SubjectResponse
from app.schemas.plataformas import PlataformasCreate, PlataformasOut, PlataformasResponse
from app.schemas.datos_nuevos import DatosNuevosCreate, DatosNuevosResponse, DatosNuevosOut
from app.schemas.flashes import FlashesCreate, FlashesOut, FlashesResponse
from app.schemas.mapa import MapaResponse, MapaCreate, MapaOut
from app.schemas.directorio import DirectorioCreate, DirectorioOut, DirectorioResponse
from app.schemas.organos import OrganosCreate, OrganosOut, OrganosResponse
from app.schemas.archivo import ArchivoCreate, ArchivoOut, ArchivoResponse
from app.schemas.snieg import SniegCreate, SniegOut, SniegResponse
from app.schemas.preguntas import PreguntasCreate, PreguntasOut, PreguntasResponse, PreguntasList
from app.schemas.sistemas import SistemasCreate, SistemasOut, SistemasResponse
from app.schemas.reportes import ReporteCreate, ReporteOut, ReporteResponse, ReporteList
from app.schemas.documentacion import DocumentacionCreate, DocumentacionOut, DocumentacionResponse, DocumentacionList
from app.schemas.profesores import ProfesoresCreate, ProfesoresOut, ProfesoresResponse
from app.schemas.instituciones import InstitucionesCreate, InstitucionesOut, InstitucionesResponse
from app.schemas.modulos import ModulosCreate, ModulosOut, ModulosResponse
from app.schemas.perfiles import PerfilesCreate, PerfilesOut, PerfilesResponse
from app.schemas.cursos import CursosCreate, CursosOut, CursosResponse
from app.schemas.docs_iieg import DocsIIEGCreate, DocsIIEGOut, DocsIIEGResponse

__all__ = [ 
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioResponse",
    "LoginRequest",
    "LoginResponse",
    "PageCreate",
    "PageUpdate",
    "PageResponse",
    "MenuItemCreate",
    "MenuItemUpdate",
    "MenuItemResponse",
    "MenuItemTree",
    "PostCreate",
    "PostOut",
    "PostResponse",
    "SubjectCreate",
    "SubjectOut",
    "SubjectResponse",
    "SubjectFlat",
    "PlataformasCreate",
    "PlataformasOut",
    "PlataformasResponse",
    "DatosNuevosCreate",
    "DatosNuevosOut",
    "DatosNuevosResponse",
    "FlashesCreate",
    "FlashesOut",
    "FlashesResponse",
    "FlashesList",
    "MapaCreate",
    "MapaOut",
    "MapaResponse",
    "DirectorioCreate",
    "DirectorioOut",
    "DirectorioResponse",
    "OrganosCreate",
    "OrganosOut",
    "OrganosResponse",
    "ArchivoCreate",
    "ArchivoOut",
    "ArchivoResponse",
    "ArchivoList",
    "SniegCreate",
    "SniegOut",
    "SniegResponse",
    "PreguntasCreate",
    "PreguntasOut",
    "PreguntasResponse",
    "PreguntasList",
    "SistemasCreate",
    "SistemasOut",
    "SistemasResponse",
    "ReporteCreate",
    "ReporteOut",
    "ReporteResponse",
    "ReporteList",
    "DocumentacionCreate",
    "DocumentacionOut",
    "DocumentacionResponse",
    "DocumentacionList",
    "ProfesoresCreate",
    "ProfesoresOut",
    "ProfesoresResponse",
    "InstitucionesCreate",
    "InstitucionesOut",
    "InstitucionesResponse",
    "ModulosCreate",
    "ModulosOut",
    "ModulosResponse",
    "PerfilesCreate",
    "PerfilesOut",
    "PerfilesResponse",
    "CursosCreate",
    "CursosOut",
    "CursosResponse",
    "DocsIIEGCreate",
    "DocsIIEGOut",
    "DocsIIEGResponse",
]
