import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Text, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

documentacion_temas = Table(
    "documentacion_temas",
    Base.metadata,
    Column("documentacion_id", Integer, ForeignKey("documentacion.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

documentacion_sistemas = Table(
    "documentacion_sistemas",
    Base.metadata,
    Column("documentacion_id", Integer, ForeignKey("documentacion.id"), primary_key=True),
    Column("sistema_id", Integer, ForeignKey("sistemas.id"), primary_key=True),
)

class TipoEnum(str, enum.Enum):
    informes = "Informes"
    analisis_estadisticos = "Análisis estadísticos"
    publicaciones = "Publicaciones institucionales"
    censos = "Documentación de censos"
    normativos = "Documentos normativos"
    metodologia = "Metodologia"
    codigo = "Código"
    manual = "Manuales"
    guias = "Guías"
    faqs = "FAQs"

class Documentacion(Base):
    __tablename__ = "documentacion"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    anyo = Column(Integer, nullable=True)
    archivo = Column(String, nullable=True)
    tipo = Column(Enum(TipoEnum), nullable=True)
    claves = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=True)
    
    temas = relationship(
        "Subject",
        secondary=documentacion_temas,
        back_populates="documentacion",
        lazy="selectin",
    )
    
    sistemas = relationship(
        "Sistemas",
        secondary=documentacion_sistemas,
        back_populates="documentacion",
        lazy="selectin",
    )