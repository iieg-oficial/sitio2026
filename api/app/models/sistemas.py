import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Table, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

sistema_temas = Table(
    "sistema_temas",
    Base.metadata,
    Column("sistema_id", Integer, ForeignKey("sistemas.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class TipoSistemaEnum(str, enum.Enum):
    plataforma = "plataforma"
    datos = "datos-recientes"
    estadistica = "estadistica"
    otro = "otro"

class Sistemas(Base):
    __tablename__ = "sistemas"

    id = Column(Integer, primary_key=True, index=True)  
    titulo = Column(String, nullable=False)
    descripcion = Column(Text, nullable=False)
    link = Column(String, nullable=False)
    tipo = Column(Enum(TipoSistemaEnum), nullable=False)
    imagen = Column(String, nullable=True)
    claves = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=False)
    destacado = Column(Boolean, default=False, nullable=True)
    orden = Column(Integer, default=0, nullable=True)

    temas = relationship(
        "Subject",
        secondary=sistema_temas,
        back_populates="sistemas",
        lazy="selectin",
    )
    