from typing import List, Optional

from pydantic import BaseModel


class OrganosBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    link: Optional[str] = None
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
