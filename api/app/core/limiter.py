from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

# Mantenemos get_remote_address como default para otros endpoints que lo usen
limiter = Limiter(key_func=get_remote_address)


async def get_login_username_key(request: Request) -> str:
    """Extrae el username del body para aplicar rate limit por usuario en lugar de IP."""
    try:
        # Pydantic/FastAPI ya guardó o procesó el JSON en la request
        body = await request.json()
        username = body.get("username")
        if username:
            return f"login:{username.lower().strip()}"
    except Exception:
        pass

    return "login:anonymous"