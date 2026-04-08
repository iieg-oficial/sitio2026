from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, borradores, media, menu, pages, pages_public, preview, public, users, posts, posts_public, subject, subject_public, plataformas, plataformas_public, datos_nuevos, datos_nuevos_public, flashes, flashes_public, mapa_public, mapa, valores, valores_public, normatividad, normatividad_public, plan_institucional, plan_institucional_public, plan_trabajo, plan_trabajo_public, directorio, directorio_public, organos, organos_public
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
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

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
    app.include_router(plataformas.router,prefix=settings.admin_prefix) 
    app.include_router(plataformas_public.router,prefix=settings.web_prefix) 
    app.include_router(datos_nuevos.router,prefix=settings.admin_prefix) 
    app.include_router(datos_nuevos_public.router,prefix=settings.web_prefix)
    app.include_router(flashes.router,prefix=settings.admin_prefix) 
    app.include_router(flashes_public.router,prefix=settings.web_prefix) 
    app.include_router(mapa.router,prefix=settings.admin_prefix) 
    app.include_router(mapa_public.router,prefix=settings.web_prefix)
    app.include_router(valores.router,prefix=settings.admin_prefix) 
    app.include_router(valores_public.router,prefix=settings.web_prefix)
    app.include_router(normatividad.router,prefix=settings.admin_prefix) 
    app.include_router(normatividad_public.router,prefix=settings.web_prefix)
    app.include_router(plan_institucional.router,prefix=settings.admin_prefix) 
    app.include_router(plan_institucional_public.router,prefix=settings.web_prefix)
    app.include_router(plan_trabajo.router,prefix=settings.admin_prefix) 
    app.include_router(plan_trabajo_public.router,prefix=settings.web_prefix)
    app.include_router(directorio.router,prefix=settings.admin_prefix) 
    app.include_router(directorio_public.router,prefix=settings.web_prefix)
    app.include_router(organos.router,prefix=settings.admin_prefix) 
    app.include_router(organos_public.router,prefix=settings.web_prefix)

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
