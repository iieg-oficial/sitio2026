from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PlanTrabajoBase(BaseModel):
    nombre: str
    descripcion: str
    fecha: Optional[datetime] = None
    documento: Optional[str] = None
    link: Optional[str] = None

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