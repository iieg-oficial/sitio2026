from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base


class Plataformas(Base):
    __tablename__ = "plataformas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(String(300))
    url = Column(String(200))
    imagen = Column(String(200))
    destacada = Column(Boolean, default=False)
    orden = Column(Integer, default=0)
