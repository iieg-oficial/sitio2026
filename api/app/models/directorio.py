from sqlalchemy import Column, Integer, String, Text, Boolean

from app.core.database import Base

class Directorio(Base):
    __tablename__ = "directorio"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    cargo = Column(String(255), nullable=False)
    director = Column(Boolean, default=False, nullable=True)