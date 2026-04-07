from pydantic import BaseModel
from typing import List

class NormatividadBase(BaseModel):
    nombre: str
    descripcion: str
    link: str | None = None
    documento: str | None = None

class NormatividadCreate(NormatividadBase):
    pass

class NormatividadOut(NormatividadBase):
    id: int

    class Config:
        from_attributes = True

class NormatividadResponse(BaseModel):
    normatividad: List[NormatividadOut]
    total: int

    class Config:
        from_attributes = True