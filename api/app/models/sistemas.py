import enum

from sqlalchemy import Column, Integer, String, Text, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class TipoSistemaEnum(str, enum.Enum):
    plataforma = "plataforma"
    datos = "datos-recientes"
    estadistica = "estadistica"
    otro = "otro"

class Sistemas(Base):
    __tablename__ = "sistemas"

    id = Column(Integer, primary_key=True, index=True)  
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    link = Column(String, nullable=False)
    tipo = Column(Enum(TipoSistemaEnum), nullable=False)
    imagen = Column(String, nullable=True)
    claves = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=False)
    