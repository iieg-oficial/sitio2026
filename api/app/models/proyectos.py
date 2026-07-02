from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Proyectos(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=False)

    cursos = relationship("Documentacion", secondary="documentacion_proyectos", back_populates="proyectos")