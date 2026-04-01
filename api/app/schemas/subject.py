from pydantic import BaseModel

class SubjectCreate(BaseModel):
    titulo: str


class SubjectOut(SubjectCreate):
    id: int
    titulo: str    

    class Config:
        from_attributes = True


class SubjectResponse(BaseModel):
    id: int
    titulo: str    

    class Config:
        from_attributes = True