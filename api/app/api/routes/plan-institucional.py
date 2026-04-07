from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.plan_institucional import PlanInstitucionalCreate, PlanInstitucionalOut, PlanInstitucionalResponse
from app.models import PlanInstitucional, Usuario
from app.api.deps import get_current_user, get_db, verify_csrf

router = APIRouter(prefix="/plan-institucional", tags=["plan-institucional"])

@router.get("/", response_model=PlanInstitucionalResponse)
def read_plan_institucional(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    plan_institucional = db.query(PlanInstitucional).all()
    return {
        "plan_institucional": plan_institucional,
        "total": len(plan_institucional),
    }

@router.post("/create", response_model=PlanInstitucionalOut)
def create_plan_institucional(
    plan_institucional: PlanInstitucionalCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_plan_institucional = PlanInstitucional(**plan_institucional.dict())
    db.add(db_plan_institucional)
    db.commit()
    db.refresh(db_plan_institucional)
    return db_plan_institucional

@router.put("/{id}", response_model=PlanInstitucionalOut)
def update_plan_institucional(
    id: int,
    plan_institucional: PlanInstitucionalCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_plan_institucional = db.query(PlanInstitucional).filter(PlanInstitucional.id == id).first()
    if not db_plan_institucional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan institucional no encontrado",
        )
    db_plan_institucional.nombre = plan_institucional.nombre
    db_plan_institucional.descripcion = plan_institucional.descripcion
    db_plan_institucional.link = plan_institucional.link
    db_plan_institucional.documento = plan_institucional.documento
    db.commit()
    db.refresh(db_plan_institucional)
    return db_plan_institucional

@router.delete("/{id}")
def delete_plan_institucional(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_plan_institucional = db.query(PlanInstitucional).filter(PlanInstitucional.id == id).first()
    if not db_plan_institucional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan institucional no encontrado",
        )
    db.delete(db_plan_institucional)
    db.commit()
    return {"message": "Plan institucional eliminado correctamente"}
        