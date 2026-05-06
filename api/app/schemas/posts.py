from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from app.schemas.subject import SubjectFlat

class PostCreate(BaseModel):
    titulo: str
    resumen: str = ""
    contenido: str
    autor: str = "IIEG"
    fecha: Optional[datetime] = None
    claves: Optional[str] = None    
    tema_ids: Optional[List[int]] = None
    slug: Optional[str] = None

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
    resumen: str
    contenido: str
    autor: str
    fecha: datetime
    claves: Optional[str] = None    
    temas: Optional[List[SubjectFlat]] = []
    slug: Optional[str] = None

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    titulo: str
    resumen: str
    contenido: str
    autor: str
    fecha: datetime
    claves: Optional[str] = None    
    temas: Optional[List[SubjectFlat]] = []
    slug: Optional[str] = None

    class Config:                              
        from_attributes = True
    
class PostList(BaseModel):
    posts: List[PostResponse]
    total: int