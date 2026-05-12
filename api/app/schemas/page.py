from datetime import datetime
from typing import Optional, List  

from pydantic import BaseModel, Field


class PageCreate(BaseModel):
    slug_custom: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str | None = Field(default=None)
    description_meta: str | None
    keywords_meta: str | None
    published_at: datetime | None
    updated_at: datetime | None
    slug: Optional[str] = None


class PageUpdate(BaseModel):
    id: int
    title: str | None = None
    slug_custom: str | None = None
    description: str | None = None
    description_meta: str | None
    keywords_meta: str | None
    published_at: datetime | None
    updated_at: datetime | None
    slug: Optional[str] = None

class PageResponse(PageCreate):
    id: int
   
    class Config:
        from_attributes = True


class PageResponseList(BaseModel):
    pages: List[PageResponse]
    total: int  
