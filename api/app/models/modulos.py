from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Modulos(Base):
    __tablename__ = "modulos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    slug = Column(String(200), nullable=False)
    
    cursos = relationship("Cursos", secondary="curso_modulos", back_populates="modulos")