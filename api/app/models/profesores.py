from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base

class Profesores(Base):
    __tablename__ = "profesores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    puesto = Column(String(200), nullable=False)
    descripcion = Column(String(200), nullable=False)
    foto = Column(String(200), nullable=False)
    
    capacitaciones = relationship("Capacitaciones", back_populates="profesor")
    