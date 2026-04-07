from sqlalchemy import Column, Integer, String, Text

from app.core.database import Base

class Normatividad(Base):
    __tablename__ = "normatividad"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    documento = Column(String(255), nullable=True)