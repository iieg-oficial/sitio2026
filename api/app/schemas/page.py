from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PageCreate(BaseModel):
    menu_item_id: str | None = Field(default=None, serialization_alias="menuItemId")
    slug_custom: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str | None = Field(default=None)
    meta_description: str | None = Field(default=None, serialization_alias="metaDescription")
    meta_keywords: str | None = Field(default=None, serialization_alias="metaKeywords")
    published_at: datetime | None = Field(default=None, serialization_alias="publishedAt")
    updated_at: datetime | None = Field(default=None, serialization_alias="updatedAt")
    slug: Optional[str] = None


class PageUpdate(BaseModel):
    id: int
    menu_item_id: str | None = Field(default=None, serialization_alias="menuItemId")
    title: str | None = None
    slug_custom: str | None = None
    description: str | None = None
    meta_description: str | None = Field(default=None, serialization_alias="metaDescription")
    meta_keywords: str | None = Field(default=None, serialization_alias="metaKeywords")
    published_at: datetime | None = Field(default=None, serialization_alias="publishedAt")
    updated_at: datetime | None = Field(default=None, serialization_alias="updatedAt")
    slug: Optional[str] = None

class PageResponse(PageCreate):
    id: int
   
    class Config:
        from_attributes = True
