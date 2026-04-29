from pydantic import BaseModel
from typing import List
from slugify import slugify

class OrganosBase(BaseModel):
    titulo: str
    descripcion: str | None = None
    link: str | None = None
    slug: Optional[str] = None

class OrganosCreate(OrganosBase):
    pass

class OrganosOut(OrganosBase):
    id: int

    class Config:
        from_attributes = True

class OrganosResponse(BaseModel):
    organos: List[OrganosOut]
    total: int

    class Config:
        from_attributes = True