from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
from enum import Enum
from app.core.database import Base

class PeriocidadEnum(str, enum.Enum):
    diaria = "diaria"
    mensual = "mensual"
    anual = "anual"

class Flashes(Base):
    __tablename__ = "flashes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    desc_jal = Column(String, nullable=False)
    desc_nac = Column(String, nullable=False)
    periodicidad = Column(Enum(PeriodicidadEnum), nullable=False)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    fuente = Column(String, nullable=True)
    link = Column(String, nullable=True)