import enum
from datetime import datetime
from slugify import slugify
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base

curso_modulos = Table(
    "curso_modulos",
    Base.metadata,
    Column("curso_id", Integer, ForeignKey("cursos.id"), primary_key=True),
    Column("modulo_id", Integer, ForeignKey("modulos.id"), primary_key=True),
)

class TipoCurso(enum.Enum):
    CAPACITACION = "Capacitación"
    CONVOCATORIA = "Convocatoria"

class Cursos(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(String(300), nullable=True)
    inicio = Column(DateTime, default=datetime.utcnow, nullable=True)
    formato = Column(String(100), nullable=True)
    Horario = Column(String(100), nullable=True)
    Objetivo = Column(String(300), nullable=True)
    p_ingreso = Column(String(100), nullable=True)
    p_egreso = Column(String(100), nullable=True)

    tipo_curso = Column(Enum(TipoCurso), nullable=False)
    destacado = Column(Boolean, default=False, nullable=True)

    
    modulos = relationship("Modulos", secondary=curso_modulos, back_populates="cursos")

    inscripcion = Column(String(200), nullable=True)
    acreditacion = Column(String(200), nullable=True)

    vigencia = Column(String(200), nullable=True)
    contacto = Column(String(200), nullable=True)

    