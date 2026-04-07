from sqlalchemy import Column, Integer, String, Text

from app.core.database import Base

class PlanInstitucional(Base):
    __tablename__ = "plan_institucional"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    documento = Column(String(255), nullable=True)
    imagen = Column(String(255), nullable=True)