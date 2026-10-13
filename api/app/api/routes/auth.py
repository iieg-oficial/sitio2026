from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.token_blacklist import revocar_token
from app.core.cookies import borrar_sesion, emitir_sesion
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.limiter import get_login_username_key, limiter
from app.core.security import crear_csrf_token, verify_password
from app.core.settings import get_settings
from app.models.user import Usuario
from app.schemas.user import LoginRequest, LoginResponse, UsuarioResponse

router = APIRouter(prefix="/autenticacion", tags=["autenticación"])
settings = get_settings()


@router.post("/iniciar-sesion", response_model=LoginResponse)
@limiter.limit("5/minute", key_func=get_login_username_key)
async def login(
    request: Request,
    credentials: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    usuario = db.query(Usuario).filter(Usuario.username == credentials.username).first()

    if not usuario or not verify_password(credentials.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    emitir_sesion(response, usuario)

    return LoginResponse(
        csrf_token=crear_csrf_token(usuario.id),
        user=UsuarioResponse.model_validate(usuario),
    )


@router.post("/cerrar-sesion")
async def logout(
    request: Request,
    response: Response,
    current_user: Usuario = Depends(get_current_user),
):
    
    payload = request.state.token_payload
    await revocar_token(payload["jti"], payload["exp"])
    borrar_sesion(response)
    return {"message": "Sesión cerrada exitosamente"}


@router.get("/perfil", response_model=UsuarioResponse)
async def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.get("/csrf")
async def refresh_csrf_token(current_user: Usuario = Depends(get_current_user)):
    return {"csrf_token": crear_csrf_token(current_user.id)}


@router.get("/verificar")
async def verify_token(current_user: Usuario = Depends(get_current_user)):
    return {"valid": True}
