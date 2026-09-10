import json
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str
    version: str
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    redis_url: str
    acervo_endpoint: str
    acervo_public_endpoint: str
    acervo_s3_url: str
    acervo_region: str = "us-east-1"
    acervo_access_key: str
    acervo_secret_key: str
    acervo_bucket_name: str
    acervo_use_ssl: bool
    acervo_verify_ssl: bool = True
    acervo_api_key: str | None = None
    acervo_api_key_header: str = "x-api-key"
    acervo_iieg_access_key: str
    acervo_iieg_secret_key: str
    acervo_iieg_bucket_name: str
    cors_origins: list[str]
    admin_prefix: str
    web_prefix: str
    cookie_name: str
    cookie_max_age: int
    cookie_domain: str | None = None
    cookie_secure: bool
    cookie_httponly: bool
    cookie_samesite: str
    csrf_secret_key: str
    csrf_token_expire_minutes: int
    docs_url: str | None = None
    redoc_url: str | None = None
    openapi_url: str

    smtp_user: str | None = None
    smtp_password: str | None = None
    contact_dest_email: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    model_config = SettingsConfigDict(
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

