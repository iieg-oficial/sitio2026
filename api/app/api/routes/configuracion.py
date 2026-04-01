from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.configuracion import ConfiguracionCreate, ConfiguracionUpdate
from app.services.configuracion import configuracion_service

router = APIRouter(prefix="/configuracion", tags=["configuración"])

@router.get("/", response_model=Configuracion)
def read_configuracion(db: Session = Depends(get_db)):
    return configuracion_service.get_configuracion(db)

@router.put("/{id}", response_model=Configuracion)
def update_configuracion(
    id: int, 
    configuracion: ConfiguracionUpdate, 
    db: Session = Depends(get_db)):
    return configuracion_service.update_configuracion(db, id, configuracion)

@router.post("/create", response_model=Configuracion)
def create_configuracion(
    configuracion: ConfiguracionCreate, 
    db: Session = Depends(get_db),
    logo: UploadFile = File(...),
    transparencia_img: UploadFile = File(...),
):
    return configuracion_service.create_configuracion(db, configuracion)

@router.delete("/{id}", response_model=Configuracion)
def delete_configuracion(
    id: int, 
    db: Session = Depends(get_db)
):
    return configuracion_service.delete_configuracion(db, id)