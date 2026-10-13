import enum
from sqlalchemy import Column, String, Text
from sqlalchemy import Enum as SQLEnum
from app.core.database import Base

class TipoServicioEnum(str, enum.Enum):
    servicio = "Servicio"
    certificacion = "Certificación"
    transparencia = "Transparencia"

class Servicios(Base):
    __tablename__ = "servicios"

    id = Column(String(200), primary_key=True, index=True)
    codigo = Column(String(200), nullable=True)
    tipo = Column(SQLEnum(TipoServicioEnum), nullable=False)
    titulo = Column(String(200), nullable=False)
    formato_entrega = Column(String(200), nullable=True)
    descripcion = Column(Text, nullable=False)
    unidad_medida = Column(String(200), nullable=True)
    costos = Column(String(200), nullable=True)
    politicas = Column(Text, nullable=True)
    slug = Column(String(200), nullable=False)