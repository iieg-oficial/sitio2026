from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decodificar_token, verificar_csrf_token
from app.core.settings import get_settings
from app.core.token_blacklist import es_token_revocado
from app.models.user import Usuario

settings = get_settings()


async def get_current_user(
    request: Request,
    access_token: str | None = Cookie(default=None, alias=settings.cookie_name),
    db: Session = Depends(get_db),
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
    )

    if access_token is None:
        raise credentials_exception

    payload = decodificar_token(access_token)
    if payload is None:
        raise credentials_exception

    jti = payload.get("jti")
    sub = payload.get("sub")
    if jti is None or sub is None:
        raise credentials_exception

    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        raise credentials_exception

    if await es_token_revocado(jti):
        raise credentials_exception

    usuario = db.get(Usuario, user_id)
    if usuario is None:
        raise credentials_exception

    if payload.get("tv") != usuario.token_version:
        raise credentials_exception

    request.state.token_payload = payload
    return usuario

async def get_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    if current_user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debe cambiar su contraseña antes de realizar esta acción.",
        )
    return current_user


def _check_csrf(request: Request, user: Usuario) -> None:
    if request.method in ("POST", "PUT", "DELETE", "PATCH"):
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "CSRF token requerido")
        if not verificar_csrf_token(csrf_token, user.id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "CSRF token inválido")

        

async def verify_csrf(
    request: Request,
    current_user: Usuario = Depends(get_active_user),
) -> Usuario:
    _check_csrf(request, current_user)
    return current_user


async def verify_csrf_allow_pending(
    request: Request,
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """Para cambio de contraseña y logout: CSRF sí, bloqueo must_change no."""
    _check_csrf(request, current_user)
    return current_user


def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: Usuario = Depends(get_active_user)) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes para esta operación",
            )
        return current_user

    return role_checker



