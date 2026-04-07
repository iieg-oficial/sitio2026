from pydantic import BaseModel
from typing import List

class PlanTrabajoBase(BaseModel):
    nombre: str
    descripcion: str
    fecha: str | None = None
    documento: str | None = None
    link: str | None = None

class PlanTrabajoCreate(PlanTrabajoBase):
    pass

class PlanTrabajoOut(PlanTrabajoBase):
    id: int

    class Config:
        from_attributes = True

class PlanTrabajoResponse(BaseModel):
    plan_trabajo: List[PlanTrabajoOut]
    total: int

    class Config:
        from_attributes = True