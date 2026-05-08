from sqlalchemy import Column, Integer, String, event
from app.core.database import Base


class DatosNuevos(Base):
    __tablename__ = "datos_nuevos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    slug = Column(String(200), nullable=False)

