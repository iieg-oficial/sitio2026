from typing import List

from pydantic import BaseModel


class DirectorioBase(BaseModel):
    nombre: str
    cargo: str
    director: bool = False

class DirectorioCreate(DirectorioBase):
    pass

class DirectorioOut(DirectorioBase):
    id: int

    class Config:
        from_attributes = True

class DirectorioResponse(BaseModel):
    items: List[DirectorioOut]
    total: int

    class Config:
        from_attributes = True