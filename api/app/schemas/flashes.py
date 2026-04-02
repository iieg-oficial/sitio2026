from pydantic import BaseModel
from datetime import datetime

class FlashesCreate(BaseModel):
    titulo: str
    desc_jal: str
    desc_nac: str
    periocidad: str = None
    fecha_publicacion: datetime = None
    fuente: str = None
    link: str = None

class FlashesOut(BaseModel):
    id: int
    titulo: str
    desc_jal: str
    desc_nac: str
    periocidad: str = None
    fecha_publicacion: datetime = None
    fuente: str = None
    link: str = None

    class Config:
        from_attributes = True

class FlashesResponse(BaseModel):
    flashes: list[FlashesOut]
    total: int