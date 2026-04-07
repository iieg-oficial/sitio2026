
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.plan_trabajo import PlanTrabajoResponse
from app.models import PlanTrabajo
from app.api.deps import get_db

router = APIRouter(prefix="/plan-trabajo", tags=["plan-trabajo-public"])

@router.get("/", response_model=PlanTrabajoResponse)
def read_plan_trabajo(
    db: Session = Depends(get_db),
    ):
    plan_trabajo = db.query(PlanTrabajo).all()
    return {
        "plan_trabajo": plan_trabajo,
        "total": len(plan_trabajo),
    }
