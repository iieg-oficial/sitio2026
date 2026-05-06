import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.core.database import Base

flash_temas = Table(
    "flash_temas",
    Base.metadata,
    Column("flash_id", Integer, ForeignKey("flashes.id"), primary_key=True),
    Column("tema_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class PeriocidadEnum(str, enum.Enum):
    diaria = "diaria"
    mensual = "mensual"
    anual = "anual"

class Flashes(Base):
    __tablename__ = "flashes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    desc_jal = Column(String, nullable=False)
    desc_nac = Column(String, nullable=False)
    periocidad = Column(Enum(PeriocidadEnum), nullable=False)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    fuente = Column(String, nullable=True)
    link = Column(String, nullable=True)
    slug = Column(String(200), nullable=False)
    
    temas = relationship(
        "Subject",
        secondary=flash_temas,
        back_populates="flashes",
        lazy="selectin",
    )