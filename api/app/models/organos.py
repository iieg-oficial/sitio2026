from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class Organos(Base):
    __tablename__ = "organos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    link = Column(String(255), nullable=True)
    slug = Column(String(200), nullable=False)