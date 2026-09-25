from contextlib import asynccontextmanager
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from fastapi import FastAPI, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.deps import get_current_user
from app.core.limiter import limiter
from app.core.settings import get_settings

# Importación de routers
from app.api.routes import (
    archivos, archivos_public, auth, banner, banner_public, borradores,
    contacto, cuadernillos, cuadernillos_public, cursos, cursos_public,
    datos_nuevos, datos_nuevos_public, directorio, directorio_public,
    docs_iieg, docs_iieg_public, documentacion, documentacion_public,
    flashes, flashes_public, instituciones, instituciones_public, mapa,
    mapa_public, media, menu, modulos, modulos_public, organos, organos_public,
    pages, pages_public, perfiles, perfiles_public, posts, posts_public,
    preguntas, preguntas_public, preview, profesores, profesores_public,
    public, reportes, reportes_public, search_public, sistemas, sistemas_public,
    snieg, snieg_public, subject, subject_public, users
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=settings.version,
        lifespan=lifespan,
        docs_url=settings.docs_url,
        redoc_url=settings.redoc_url,
        openapi_url=settings.openapi_url,
    )

    TRUSTED_PROXIES = ["127.0.0.1", "172.28.0.10", "10.0.0.0/8"]

    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=TRUSTED_PROXIES)

    # 2. Registrar Slowapi en la aplicación
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Configuración de CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/static", StaticFiles(directory="static"), name="static")

    # -------------------------------------------------------------------------
    # ROUTERS PÚBLICOS (Sin autenticación)
    # -------------------------------------------------------------------------
    
    # Auth (Login) DEBE ser público para poder autenticarse
    app.include_router(auth.router, prefix=settings.admin_prefix)
    
    # Formulario de contacto público
    app.include_router(contacto.router, prefix=settings.web_prefix, tags=["contacto"])

    # Rutas públicas del sitio web
    app.include_router(public.router, prefix=settings.web_prefix)
    app.include_router(pages_public.router, prefix=settings.web_prefix)
    app.include_router(preview.public_router, prefix=settings.web_prefix)
    app.include_router(posts_public.router, prefix=settings.web_prefix) 
    app.include_router(subject_public.router, prefix=settings.web_prefix) 
    app.include_router(datos_nuevos_public.router, prefix=settings.web_prefix)
    app.include_router(flashes_public.router, prefix=settings.web_prefix) 
    app.include_router(mapa_public.router, prefix=settings.web_prefix)
    app.include_router(directorio_public.router, prefix=settings.web_prefix)
    app.include_router(organos_public.router, prefix=settings.web_prefix)
    app.include_router(archivos_public.router, prefix=settings.web_prefix)
    app.include_router(snieg_public.router, prefix=settings.web_prefix)
    app.include_router(preguntas_public.router, prefix=settings.web_prefix)
    app.include_router(sistemas_public.router, prefix=settings.web_prefix)
    app.include_router(reportes_public.router, prefix=settings.web_prefix)   
    app.include_router(documentacion_public.router, prefix=settings.web_prefix)
    app.include_router(profesores_public.router, prefix=settings.web_prefix)
    app.include_router(instituciones_public.router, prefix=settings.web_prefix)
    app.include_router(modulos_public.router, prefix=settings.web_prefix)
    app.include_router(perfiles_public.router, prefix=settings.web_prefix)
    app.include_router(cursos_public.router, prefix=settings.web_prefix)
    app.include_router(docs_iieg_public.router, prefix=settings.web_prefix)
    app.include_router(banner_public.router, prefix=settings.web_prefix)
    app.include_router(cuadernillos_public.router, prefix=settings.web_prefix)
    app.include_router(search_public.router, prefix=settings.web_prefix)

    # -------------------------------------------------------------------------
    # ROUTERS PRIVADOS / ADMINISTRACIÓN (Requieren token)
    # -------------------------------------------------------------------------
    admin_router = APIRouter(
        prefix=settings.admin_prefix,
        dependencies=[Depends(get_current_user)]
    )

    # Rutas protegidas (No repetimos `prefix=settings.admin_prefix` aquí adentro)
    admin_router.include_router(users.router)
    admin_router.include_router(pages.router)
    admin_router.include_router(menu.router)
    admin_router.include_router(media.router)
    admin_router.include_router(borradores.router)
    admin_router.include_router(preview.admin_router)
    admin_router.include_router(posts.router) 
    admin_router.include_router(subject.router) 
    admin_router.include_router(datos_nuevos.router) 
    admin_router.include_router(flashes.router) 
    admin_router.include_router(mapa.router) 
    admin_router.include_router(directorio.router) 
    admin_router.include_router(organos.router) 
    admin_router.include_router(archivos.router) 
    admin_router.include_router(snieg.router) 
    admin_router.include_router(preguntas.router) 
    admin_router.include_router(sistemas.router) 
    admin_router.include_router(reportes.router) 
    admin_router.include_router(documentacion.router) 
    admin_router.include_router(profesores.router) 
    admin_router.include_router(instituciones.router) 
    admin_router.include_router(modulos.router) 
    admin_router.include_router(perfiles.router) 
    admin_router.include_router(cursos.router) 
    admin_router.include_router(docs_iieg.router) 
    admin_router.include_router(banner.router) 
    admin_router.include_router(cuadernillos.router)

    # Incluir el super-router de administración en la app principal
    app.include_router(admin_router)

    # Healthchecks
    @app.get("/", tags=["health"])
    async def healthcheck():
        return {
            "status": "ok",
            "project": settings.project_name,
            "version": settings.version,
        }

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "healthy"}

    return app


app = create_app()