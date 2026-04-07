from datetime import datetime
from sqlalchemy import Column, Integer, String, Text

from app.core.database import Base

class PlanTrabajo(Base):
    __tablename__ = "plan_trabajo"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    fecha = Column(DateTime, nullable=True)
    documento = Column(String(255), nullable=True)
    link = Column(String(255), nullable=True)