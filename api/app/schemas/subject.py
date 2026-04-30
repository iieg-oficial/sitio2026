from pydantic import BaseModel
from slugify import slugify
from typing import Optional

class SubjectCreate(BaseModel):
    titulo: str
    slug: Optional[str] = None


class SubjectOut(SubjectCreate):
    id: int
    titulo: str    
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class SubjectResponse(BaseModel):
    id: int
    titulo: str    
    slug: Optional[str] = None

    class Config:
        from_attributes = True