from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base  

class Instituciones(Base):
    __tablename__ = "instituciones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(String(200), nullable=False)
    logo = Column(String(200), nullable=False)
    
    capacitaciones = relationship("Capacitaciones", back_populates="institucion")