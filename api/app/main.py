from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    archivos,
    archivos_public,
    auth,
    banner,
    banner_public,
    borradores,
    contacto,
    cuadernillos,
    cuadernillos_public,
    cursos,
    cursos_public,
    datos_nuevos,
    datos_nuevos_public,
    directorio,
    directorio_public,
    docs_iieg,
    docs_iieg_public,
    documentacion,
    documentacion_public,
    flashes,
    flashes_public,
    instituciones,
    instituciones_public,
    mapa,
    mapa_public,
    media,
    menu,
    modulos,
    modulos_public,
    organos,
    organos_public,
    pages,
    pages_public,
    perfiles,
    perfiles_public,
    posts,
    posts_public,
    preguntas,
    preguntas_public,
    preview,
    profesores,
    profesores_public,
    public,
    reportes,
    reportes_public,
    search_public,
    sistemas,
    sistemas_public,
    snieg,
    snieg_public,
    subject,
    subject_public,
    users,
    seo_public,
)
from app.core.settings import get_settings

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

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.include_router(auth.router, prefix=settings.admin_prefix)
    app.include_router(users.router, prefix=settings.admin_prefix)
    app.include_router(pages.router, prefix=settings.admin_prefix)
    app.include_router(pages_public.router, prefix=settings.web_prefix)
    app.include_router(menu.router, prefix=settings.admin_prefix)
    app.include_router(media.router, prefix=settings.admin_prefix)
    app.include_router(borradores.router, prefix=settings.admin_prefix)
    app.include_router(preview.admin_router, prefix=settings.admin_prefix)
    app.include_router(preview.public_router, prefix=settings.web_prefix)
    app.include_router(public.router, prefix=settings.web_prefix)
    app.include_router(posts.router,prefix=settings.admin_prefix)
    app.include_router(posts_public.router,prefix=settings.web_prefix)
    app.include_router(subject.router,prefix=settings.admin_prefix)
    app.include_router(subject_public.router,prefix=settings.web_prefix)
    app.include_router(datos_nuevos.router,prefix=settings.admin_prefix)
    app.include_router(datos_nuevos_public.router,prefix=settings.web_prefix)
    app.include_router(flashes.router,prefix=settings.admin_prefix)
    app.include_router(flashes_public.router,prefix=settings.web_prefix)
    app.include_router(mapa.router,prefix=settings.admin_prefix)
    app.include_router(mapa_public.router,prefix=settings.web_prefix)
    app.include_router(directorio.router,prefix=settings.admin_prefix)
    app.include_router(directorio_public.router,prefix=settings.web_prefix)
    app.include_router(organos.router,prefix=settings.admin_prefix)
    app.include_router(organos_public.router,prefix=settings.web_prefix)
    app.include_router(archivos.router,prefix=settings.admin_prefix)
    app.include_router(archivos_public.router,prefix=settings.web_prefix)
    app.include_router(snieg.router,prefix=settings.admin_prefix)
    app.include_router(snieg_public.router,prefix=settings.web_prefix)
    app.include_router(preguntas.router,prefix=settings.admin_prefix)
    app.include_router(preguntas_public.router,prefix=settings.web_prefix)
    app.include_router(sistemas.router,prefix=settings.admin_prefix)
    app.include_router(sistemas_public.router,prefix=settings.web_prefix)
    app.include_router(reportes.router,prefix=settings.admin_prefix)
    app.include_router(reportes_public.router,prefix=settings.web_prefix)
    app.include_router(documentacion.router,prefix=settings.admin_prefix)
    app.include_router(documentacion_public.router,prefix=settings.web_prefix)
    app.include_router(profesores.router,prefix=settings.admin_prefix)
    app.include_router(profesores_public.router,prefix=settings.web_prefix)
    app.include_router(instituciones.router,prefix=settings.admin_prefix)
    app.include_router(instituciones_public.router,prefix=settings.web_prefix)
    app.include_router(modulos.router,prefix=settings.admin_prefix)
    app.include_router(modulos_public.router,prefix=settings.web_prefix)
    app.include_router(perfiles.router,prefix=settings.admin_prefix)
    app.include_router(perfiles_public.router,prefix=settings.web_prefix)
    app.include_router(cursos.router,prefix=settings.admin_prefix)
    app.include_router(cursos_public.router,prefix=settings.web_prefix)
    app.include_router(docs_iieg.router,prefix=settings.admin_prefix)
    app.include_router(docs_iieg_public.router,prefix=settings.web_prefix)
    app.include_router(banner.router,prefix=settings.admin_prefix)
    app.include_router(banner_public.router,prefix=settings.web_prefix)
    app.include_router(contacto.router,prefix=settings.web_prefix)
    app.include_router(cuadernillos.router,prefix=settings.admin_prefix)
    app.include_router(cuadernillos_public.router,prefix=settings.web_prefix)
    app.include_router(search_public.router,prefix=settings.web_prefix)
    app.include_router(seo_public.router,prefix=settings.web_prefix)



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
