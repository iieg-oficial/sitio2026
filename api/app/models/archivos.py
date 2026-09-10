from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from app.core.database import Base

archivo_temas = Table(
    "archivo_temas",
    Base.metadata,
    Column("archivo_id", Integer, ForeignKey("archivos.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class Archivos(Base):
    __tablename__ = "archivos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=True)
    tipo = Column(String(200), nullable=False)
    periocidad = Column(String(200), nullable=True)
    archivo = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=False)

    temas = relationship(
        "Subject",
        secondary=archivo_temas,
        back_populates="archivos",
        lazy="selectin",
    )
