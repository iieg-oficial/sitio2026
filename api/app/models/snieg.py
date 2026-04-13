from sqlalchemy import Column, Integer, String, Text

from app.core.database import Base

class Snieg(Base):
    __tablename__ = "snieg"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    imagen = Column(String(255), nullable=True)
    enlace = Column(String(255), nullable=True)