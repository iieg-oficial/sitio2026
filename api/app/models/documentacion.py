from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from slugify import slugify
from app.core.database import Base

class Documentacion(Base):
    __tablename__ = "documentacion"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(String(200), nullable=False)
    metodologia = Column(String(200), nullable=True)
    codigo = Column(String(200), nullable=True)
    claves = Column(String(200), nullable=True)
    
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=True)
    subject = relationship("Subject", back_populates="documentacion")