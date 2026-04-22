from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base

class Perfiles(Base):
    __tablename__ = "perfiles"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(String(200), nullable=True)
    area = Column(String(200), nullable=True)
    
    