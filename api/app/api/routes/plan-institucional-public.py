from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.plan_institucional import PlanInstitucionalResponse
from app.models import PlanInstitucional
from app.api.deps import get_db

router = APIRouter(prefix="/plan-institucional", tags=["plan-institucional-public"])

@router.get("/", response_model=PlanInstitucionalResponse)
def read_plan_institucional(
    db: Session = Depends(get_db),
    ):
    plan_institucional = db.query(PlanInstitucional).all()
    return {
        "plan_institucional": plan_institucional,
        "total": len(plan_institucional),
    }
