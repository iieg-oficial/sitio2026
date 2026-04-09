from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemResponse,
    MenuItemTree,
    MenuItemUpdate,
)
from app.schemas.page import PageCreate, PageResponse, PageUpdate, BlockSchema
from app.schemas.user import LoginRequest, LoginResponse, UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.schemas.posts import PostCreate, PostOut, PostResponse
from app.schemas.subject import SubjectCreate, SubjectOut, SubjectResponse
from app.schemas.plataformas import PlataformasCreate, PlataformasOut, PlataformasResponse
from app.schemas.datos_nuevos import DatosNuevosCreate, DatosNuevosResponse, DatosNuevosOut
from app.schemas.flashes import FlashesCreate, FlashesOut, FlashesResponse
from app.schemas.mapa import MapaResponse, MapaCreate, MapaOut
from app.schemas.valores import ValoresCreate, ValoresOut, ValoresResponse
from app.schemas.normatividad import NormatividadCreate, NormatividadOut, NormatividadResponse
from app.schemas.plan_institucional import PlanInstitucionalCreate, PlanInstitucionalOut, PlanInstitucionalResponse
from app.schemas.plan_trabajo import PlanTrabajoCreate, PlanTrabajoOut, PlanTrabajoResponse
from app.schemas.directorio import DirectorioCreate, DirectorioOut, DirectorioResponse
from app.schemas.organos import OrganosCreate, OrganosOut, OrganosResponse
from app.schemas.archivo import ArchivoCreate, ArchivoOut, ArchivoResponse

__all__ = [
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioResponse",
    "LoginRequest",
    "LoginResponse",
    "BlockSchema",
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
    "PlataformasCreate",
    "PlataformasOut",
    "PlataformasResponse",
    "DatosNuevosCreate",
    "DatosNuevosOut",
    "DatosNuevosResponse",
    "FlashesCreate",
    "FlashesOut",
    "FlashesResponse",
    "MapaCreate",
    "MapaOut",
    "MapaResponse",
    "ValoresCreate",
    "ValoresOut",
    "ValoresResponse",
    "NormatividadCreate",
    "NormatividadOut",
    "NormatividadResponse",
    "PlanInstitucionalCreate",
    "PlanInstitucionalOut",
    "PlanInstitucionalResponse",
    "PlanTrabajoCreate",
    "PlanTrabajoOut",
    "PlanTrabajoResponse",
    "DirectorioCreate",
    "DirectorioOut",
    "DirectorioResponse",
    "OrganosCreate",
    "OrganosOut",
    "OrganosResponse",
    "ArchivoCreate",
    "ArchivoOut",
    "ArchivoResponse",
]
