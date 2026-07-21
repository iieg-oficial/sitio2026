import enum
from sqlalchemy import Column, Integer, String, Text, Enum
from app.core.database import Base

class NuevoEnum(str, enum.Enum):
    sube = "sube"
    baja = "baja"
    igual = "igual"

class DatosNuevos(Base):
    __tablename__ = "datos_nuevos"

    id = Column(Integer, primary_key=True, index=True)
    cifras = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    slug = Column(String(200), nullable=False)
    tipo = Column(Enum(NuevoEnum, name="nuevoenum"), nullable=True, default=NuevoEnum.igual)
