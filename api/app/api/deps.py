from fastapi import Cookie, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decodificar_token, verificar_csrf_token
from app.core.settings import get_settings
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
        print(f"DEBUG: access_token is None for cookie {settings.cookie_name}")
        print(f"DEBUG: Cookies in request: {request.cookies}")
        raise credentials_exception

    payload = decodificar_token(access_token)
    if payload is None:
        print(f"DEBUG: payload is None for token {access_token[:10]}...")
        raise credentials_exception

    username: str | None = payload.get("sub")
    if username is None:
        print(f"DEBUG: username is None in payload")
        raise credentials_exception

    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if usuario is None:
        print(f"DEBUG: usuario {username} not found in DB")
        raise credentials_exception

    return usuario


async def verify_csrf(
    request: Request,
    current_user: Usuario = Depends(get_current_user),
):
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token requerido",
            )

        if not verificar_csrf_token(csrf_token, current_user.username):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token inválido",
            )

    return current_user


def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes para esta operación",
            )
        return current_user

    return role_checker
