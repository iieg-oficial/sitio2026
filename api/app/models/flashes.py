import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

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
    periocidad = Column(Enum(PeriocidadEnum), nullable=False)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    fuente = Column(String, nullable=True)
    link = Column(String, nullable=True)
    slug = Column(String(200), nullable=False)
    
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=True)
    subject = relationship("Subject", back_populates="flashes")