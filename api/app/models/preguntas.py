from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Preguntas(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    respuesta = Column(Text, nullable=False)
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=True)
    subject = relationship("Subject", back_populates="preguntas")