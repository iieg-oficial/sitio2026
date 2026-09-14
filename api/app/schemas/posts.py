from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.schemas.subject import SubjectFlat


class GalleryImageCreate(BaseModel):
    url: str
    order: int

class GalleryImageOut(BaseModel):
    id: int
    url: str
    order: int
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    titulo: str
    resumen: Optional[str] = None
    contenido: Optional[str]
    gallery_urls: list[str] = []
    autor: str = "IIEG"
    fecha: Optional[datetime] = None
    claves: Optional[str] = None
    tema_ids: Optional[List[int]] = None
    slug: Optional[str] = None
    video: Optional[str] = None

    @field_validator('tema_ids', mode='before')
    @classmethod
    def clean_temas(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [x for x in v if x is not None and x != 0]
        return v

class PostOut(BaseModel):
    id: int
    titulo: str
    resumen: Optional[str]
    contenido: Optional[str]
    gallery_images: list[GalleryImageOut]
    autor: Optional[str]
    fecha: Optional[datetime]
    claves: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    slug: Optional[str] = None
    video: Optional[str] = None

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    titulo: str
    resumen: Optional[str]
    contenido: Optional[str]
    gallery_images: list[GalleryImageOut]
    autor: Optional[str]
    fecha: Optional[datetime]
    claves: Optional[str] = None
    temas: Optional[List[SubjectFlat]] = []
    slug: Optional[str] = None
    video: Optional[str] = None

    class Config:
        from_attributes = True

class PostList(BaseModel):
    posts: List[PostResponse]
    total: int
