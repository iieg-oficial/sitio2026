from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Reportes(Base):
    __tablename__ = "reportes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(String(200), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=True)
    periocidad = Column(String(200), nullable=True)
    subtema = Column(String(200), nullable=True)
    archivo = Column(String(200), nullable=True)

    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=True)
    subject = relationship("Subject", back_populates="reportes")