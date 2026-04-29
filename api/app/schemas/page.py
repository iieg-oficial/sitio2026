from datetime import datetime
from slugify import slugify
from typing import Any, Literal

from pydantic import BaseModel, Field, ConfigDict


class BlockSchema(BaseModel):
    type: Literal["hero", "text", "image"]
    order: int
    content: dict[str, Any]
    props: dict[str, Any]


class PageCreate(BaseModel):
    menu_item_id: str | None = Field(default=None, serialization_alias="menuItemId")
    slug_custom: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str | None = Field(default=None)
    sections: list[dict] = Field(default_factory=list)
    meta_description: str | None = Field(default=None, serialization_alias="metaDescription")
    meta_keywords: str | None = Field(default=None, serialization_alias="metaKeywords")
    published_at: datetime | None = Field(default=None, serialization_alias="publishedAt")
    updated_at: datetime | None = Field(default=None, serialization_alias="updatedAt")
    blocks: list[BlockSchema] = []
    slug: Optional[str] = None


class PageUpdate(BaseModel):
    title: str | None = None
    slug_custom: str | None = None
    description: str | None = None
    sections: list[dict] | None = None
    meta_description: str | None = Field(default=None, serialization_alias="metaDescription")
    meta_keywords: str | None = Field(default=None, serialization_alias="metaKeywords")
    expected_updated_at: datetime | None = Field(default=None, alias="expectedUpdatedAt")
    slug: Optional[str] = None

    blocks: list[BlockSchema] = []


class PageResponse(PageCreate):
    id: int
   
    class Config:
        from_attributes = True
