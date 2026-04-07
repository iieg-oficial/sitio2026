from pydantic import BaseModel
from typing import List

class PlanInstitucionalBase(BaseModel):
    nombre: str
    descripcion: str
    documento: str | None = None
    link: str | None = None
    imagen: str | None = None

class PlanInstitucionalCreate(PlanInstitucionalBase):
    pass

class PlanInstitucionalOut(PlanInstitucionalBase):
    id: int

    class Config:
        from_attributes = True

class PlanInstitucionalResponse(BaseModel):
    plan_institucional: List[PlanInstitucionalOut]
    total: int

    class Config:
        from_attributes = True