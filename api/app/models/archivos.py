from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Archivos(Base):
    __tablename__ = "archivos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    tipo = Column(Integer, nullable=False)
    periocidad = Column(String(200), nullable=True)
    
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=False)
    subject = relationship("Subject", back_populates="archivos")
    