from datetime import datetime
import enum
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Enum, Table, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

reporte_temas = Table(
    "reporte_temas",
    Base.metadata,
    Column("reporte_id", Integer, ForeignKey("reportes.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class PeriocidadEnum(str, enum.Enum):
    diaria = "diaria"
    mensual = "mensual"
    anual = "anual"

class Reportes(Base):
    __tablename__ = "reportes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(Text, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=True)
    periocidad = Column(Enum(PeriocidadEnum), nullable=True)    
    archivo = Column(String(200), nullable=True)
    claves = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=False)

    temas = relationship(
        "Subject",
        secondary=reporte_temas,
        back_populates="reportes",
        lazy="selectin",
    )