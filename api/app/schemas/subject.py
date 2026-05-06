from __future__ import annotations
from pydantic import BaseModel

from typing import Optional, List


class SubjectBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True


class SubjectCreate(SubjectBase):
    pass


# Flat schema for the list endpoint — no nested subtemas to avoid cyclic refs
class SubjectFlat(SubjectBase):
    id: int

    class Config:
        from_attributes = True


# Recursive schema for the tree endpoint
class SubjectOut(SubjectBase):
    id: int
    subtemas: Optional[List[SubjectOut]] = []

    class Config:
        from_attributes = True


class SubjectResponse(SubjectOut):
    subtemas: Optional[List[SubjectResponse]] = []


SubjectOut.model_rebuild()
SubjectResponse.model_rebuild()