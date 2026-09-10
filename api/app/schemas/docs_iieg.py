from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.docs_iieg import TipoDocsEnum


class DocsIIEGCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tipo: TipoDocsEnum
    imagen: Optional[str] = None
    link: Optional[str] = None
    documento: Optional[str] = None
    fecha: Optional[datetime] = None
    slug: Optional[str] = None


class DocsIIEGOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    tipo: TipoDocsEnum
    imagen: Optional[str] = None
    link: Optional[str] = None
    documento: Optional[str] = None
    fecha: Optional[datetime] = None
    slug: Optional[str] = None

    class Config:
        from_attributes = True

class DocsIIEGResponse(BaseModel):
    docs_iieg: List[DocsIIEGOut]
    total: int
