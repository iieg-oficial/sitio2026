from sqlalchemy import Column, Integer, String
from app.core.database import Base
from slugify import slugify

class DatosNuevos(Base):
    __tablename__ = "datos_nuevos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, nullable=False)
    descripcion = Column(String, nullable=False)
    slug = Column(String(200), nullable=False)