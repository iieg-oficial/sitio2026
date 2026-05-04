from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Archivos(Base):
    __tablename__ = "archivos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=True)
    tipo = Column(String(200), nullable=False)
    periocidad = Column(String(200), nullable=True)
    archivo = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=False)
    
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=True)
    subject = relationship("Subject", back_populates="archivos")
    