from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

documentacion_temas = Table(
    "documentacion_temas",
    Base.metadata,
    Column("documentacion_id", Integer, ForeignKey("documentacion.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class Documentacion(Base):
    __tablename__ = "documentacion"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    metodologia = Column(Text, nullable=True)
    codigo = Column(String(200), nullable=True)
    claves = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=True)
    
    temas = relationship(
        "Subject",
        secondary=documentacion_temas,
        back_populates="documentacion",
        lazy="selectin",
    )