from pydantic import BaseModel
from typing import List

class ValoresBase(BaseModel):
    nombre: str
    descripcion: str
    imagen: str | None = None

class ValoresCreate(ValoresBase):
    pass

class ValoresOut(ValoresBase):
    id: int

    class Config:
        from_attributes = True

class ValoresResponse(BaseModel):
    valores: List[ValoresOut]
    total: int

    class Config:
        from_attributes = True