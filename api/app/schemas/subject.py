from __future__ import annotations
from pydantic import BaseModel

from typing import Optional, List

class SubjectBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    slug: Optional[str] = None
    

class SubjectCreate(SubjectBase):
    parent_id: Optional[int] = None


class SubjectOut(SubjectBase):
    id: int
    subtemas: Optional[List[SubjectOut]] = []
    profundidad: int = 0

    class Config:
        from_attributes = True
    

class SubjectResponse(SubjectOut):
    subtemas: Optional[List[SubjectResponse]] = []
    pass

SubjectOut.model_rebuild()  