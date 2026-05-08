from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class DatosNuevos(Base):
    __tablename__ = "datos_nuevos"

    id = Column(Integer, primary_key=True, index=True)
    cifras = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    slug = Column(String(200), nullable=False)

