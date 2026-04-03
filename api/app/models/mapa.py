from datetime import datetime
from sqlalchemy import Column, Integer, String

from app.core.database import Base

class Mapa(Base):
    __tablename__ = "mapa"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    anyo = Column(Integer, nullable=False)
    imagen = Column(String, nullable=True)
    archivo = Column(String, nullable=True)
    autor = Column(String, nullable=True)
    medida = Column(String, nullable=True)
    escala = Column(String, nullable=True)
    edicion = Column(String, nullable=True)
    editor = Column(String, nullable=True)
    sitio_web = Column(String, nullable=True)
    ubicacion = Column(String, nullable=True)
    informacion = Column(String, nullable=True)
    