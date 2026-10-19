from datetime import timedelta

from fastapi import Response

from app.core.security import crear_access_token
from app.core.settings import get_settings

settings = get_settings()


def emitir_sesion(response: Response, usuario) -> None:
    token = crear_access_token(
        data={"sub": str(usuario.id), "tv": usuario.token_version},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=settings.cookie_max_age,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/",
    )


def borrar_sesion(response: Response) -> None:
    response.delete_cookie(
        key=settings.cookie_name,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/",
    )