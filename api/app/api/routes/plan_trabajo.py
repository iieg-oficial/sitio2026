
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.plan_trabajo import PlanTrabajoCreate, PlanTrabajoOut, PlanTrabajoResponse
from app.models import PlanTrabajo, Usuario
from app.api.deps import get_current_user, get_db, verify_csrf

router = APIRouter(prefix="/plan-trabajo", tags=["plan-trabajo"])

@router.get("/", response_model=PlanTrabajoResponse)
def read_plan_trabajo(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    plan_trabajo = db.query(PlanTrabajo).all()
    return {
        "plan_trabajo": plan_trabajo,
        "total": len(plan_trabajo),
    }

@router.post("/create", response_model=PlanTrabajoOut)
def create_plan_trabajo(
    plan_trabajo: PlanTrabajoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_plan_trabajo = PlanTrabajo(**plan_trabajo.dict())
    db.add(db_plan_trabajo)
    db.commit()
    db.refresh(db_plan_trabajo)
    return db_plan_trabajo

@router.put("/{id}", response_model=PlanTrabajoOut)
def update_plan_trabajo(
    id: int,
    plan_trabajo: PlanTrabajoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_plan_trabajo = db.query(PlanTrabajo).filter(PlanTrabajo.id == id).first()
    if not db_plan_trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de trabajo no encontrado",
        )
    db_plan_trabajo.nombre = plan_trabajo.nombre
    db_plan_trabajo.descripcion = plan_trabajo.descripcion
    db_plan_trabajo.fecha = plan_trabajo.fecha
    db_plan_trabajo.documento = plan_trabajo.documento
    db_plan_trabajo.link = plan_trabajo.link
    db.commit()
    db.refresh(db_plan_trabajo)
    return db_plan_trabajo

@router.delete("/{id}")
def delete_plan_trabajo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    ):
    db_plan_trabajo = db.query(PlanTrabajo).filter(PlanTrabajo.id == id).first()
    if not db_plan_trabajo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de trabajo no encontrado",
        )
    db.delete(db_plan_trabajo)
    db.commit()
    return {"message": "Plan de trabajo eliminado correctamente"}