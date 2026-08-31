import enum
from sqlalchemy import Column, Integer, String, Enum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class AreaEnum(str, enum.Enum):
    desarrollo = "desarrollo"
    analisis = "analisis"
    geoespacial = "geoespacial"    
    grafico = "grafico"
    juridico = "juridico"
    administracion = "administracion"
    soporte = "soporte"

class Perfiles(Base):
    __tablename__ = "perfiles"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    area = Column(Enum(AreaEnum), nullable=True)
    slug = Column(String(200), nullable=False)

    cursos = relationship("Cursos", secondary="curso_perfiles", back_populates="perfiles")

        