from __future__ import annotations
from datetime import datetime
from typing import Optional, List 
from pydantic import BaseModel

class PageBase(BaseModel):
    title: str
    description: Optional[str] = None
    link_interno: Optional[bool] = True
    slug_custom: str
    description_meta: Optional[str] = None
    keywords_meta: Optional[str] = None
    updated_at: Optional[datetime] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True

class PageCreate(PageBase):
    pass


class PageFlat(PageBase):
    id: int

    class Config:
        from_attributes = True


class PageTreeOut(PageBase):
    id: int
    subpages: Optional[List[PageTreeOut]] = []

    class Config:
        from_attributes = True


class PageUpdate(BaseModel):
    id: int
    title: str
    slug_custom: str
    link_interno: Optional[bool] = True
    description: Optional[str] = None
    description_meta: Optional[str] = None
    keywords_meta: Optional[str] = None
    updated_at: Optional[datetime] | None = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True

class PageResponse(PageTreeOut):
    subpages: Optional[List[PageResponse]] = []


class PageResponseList(BaseModel):
    pages: List[PageResponse]
    total: int  


PageTreeOut.model_rebuild()
PageResponse.model_rebuild()