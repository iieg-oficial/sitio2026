from pydantic import BaseModel
from app.schemas.media import MediaBase

class ConfiguracionBase(BaseModel):
    nombre: str
    facebook: str
    twitter: str
    instagram: str
    youtube: str
    transparencia_url: str
    transparencia_img: MediaBase
    logo: MediaBase

class ConfiguracionCreate(ConfiguracionBase):
    pass

class ConfiguracionUpdate(ConfiguracionBase):
    pass

class Configuracion(ConfiguracionBase):
    id: int

    class Config:
        orm_mode = True