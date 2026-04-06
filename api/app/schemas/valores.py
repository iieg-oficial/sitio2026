from pydantic import BaseModel
from datetime import datetime

class ValoresBase(BaseModel):
    nombre: str
    descripcion: str
    imagen: str | None = None

class ValoresCreate(ValoresBase):
    pass

class ValoresOut(ValoresBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ValoresResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    imagen: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True