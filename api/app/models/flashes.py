from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

class Flashes(Base):
    __tablename__ = "flashes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    desc_jal = Column(String, nullable=False)
    desc_nac = Column(String, nullable=False)
    periocidad = Column(String, nullable=True)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    fuente = Column(String, nullable=True)
    link = Column(String, nullable=True)