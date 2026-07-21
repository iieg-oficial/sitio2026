from pydantic import BaseModel
from typing import List, Optional
from app.models.docs_iieg import TipoDocsEnum
from datetime import datetime
from enum import Enum
from app.models.docs_iieg import TipoDocsEnum

class DocsIIEGCreate(BaseModel):
    nombre: str
    descripcion: Optional[str]
    tipo: TipoDocsEnum
    imagen: Optional[str] = None
    link: Optional[str] = None
    documento: Optional[str] = None
    fecha: Optional[datetime] = None
    slug: Optional[str] = None
    

class DocsIIEGOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
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