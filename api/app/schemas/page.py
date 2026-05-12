from datetime import datetime
from typing import Optional, List  

from pydantic import BaseModel, Field


class PageCreate(BaseModel):
    slug_custom: str
    title: str
    description: Optional[str]
    link_interno: Optional[bool] = True
    description_meta: Optional[str]
    keywords_meta: Optional[str]
    updated_at: Optional[datetime]


class PageUpdate(BaseModel):
    id: int
    title: str
    slug_custom: str
    link_interno: Optional[bool] = True
    description: Optional[str]
    description_meta: Optional[str]
    keywords_meta: Optional[str]
    updated_at: Optional[datetime]
    slug: Optional[str]

class PageResponse(PageCreate):
    id: int
   
    class Config:
        from_attributes = True


class PageResponseList(BaseModel):
    pages: List[PageResponse]
    total: int  
