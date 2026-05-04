from typing import List, Optional
from pydantic import BaseModel


class DirectorioBase(BaseModel):
    nombre: str
    cargo: str
    director: bool = False
    slug: Optional[str] = None

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