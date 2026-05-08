from sqlalchemy import Column, Integer, String, Boolean, Text
from app.core.database import Base

class Banner(Base):
    __tablename__ = "banner"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    imagen_desktop = Column(String(200), nullable=True)
    imagen_mobile = Column(String(200), nullable=True)
    link = Column(String(200), nullable=True)
    boton = Column(String(200), nullable=True)
    color_fondo = Column(String(200), nullable=True)
    full_screen = Column(Boolean, default=False, nullable=True)
    slug = Column(String(200), nullable=True)