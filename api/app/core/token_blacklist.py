import time

from redis.asyncio import Redis

from .settings import get_settings

settings = get_settings()

redis_client = Redis.from_url(
    settings.redis_blacklist_url,
    decode_responses=True,
    socket_connect_timeout=1,
    socket_timeout=1,
)

_PREFIX = "jwt:blacklist:"


async def revocar_token(jti: str, exp: int) -> None:
    ttl = int(exp - time.time())
    if ttl > 0:
        await redis_client.setex(f"{_PREFIX}{jti}", ttl, "1")


async def es_token_revocado(jti: str) -> bool:
    return bool(await redis_client.exists(f"{_PREFIX}{jti}"))