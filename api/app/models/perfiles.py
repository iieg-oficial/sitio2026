import enum
from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base

class AreaEnum(str, enum.Enum):
    desarrollo = "desarrollo"
    analisis = "analisis"
    geoespacial = "geoespacial"    
    grafico = "grafico"
    juridico = "juridico"
    administracion = "administracion"

class Perfiles(Base):
    __tablename__ = "perfiles"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(String(200), nullable=True)
    area = Column(Enum(AreaEnum), nullable=True)

    cursos = relationship("Cursos", secondary="curso_perfiles", back_populates="perfiles")

        