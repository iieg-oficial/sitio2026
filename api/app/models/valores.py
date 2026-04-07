from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, JSON, String, Text

from app.core.database import Base

class Valores(Base):
    __tablename__ = "valores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    imagen = Column(String(255), nullable=True)