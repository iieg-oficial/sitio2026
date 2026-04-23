import enum
from datetime import datetime
from slugify import slugify
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base

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

    profesores_id = Column(Integer, ForeignKey("profesores.id"), nullable=True)
    profesor = relationship("Profesores", back_populates="cursos")
    
    modulo_id = Column(Integer, ForeignKey("modulo.id"), nullable=True)
    modulo = relationship("Modulo", back_populates="cursos")

    inscripcion = Column(String(200), nullable=True)
    acreditacion = Column(String(200), nullable=True)

    perfiles_id = Column(Integer, ForeignKey("perfiles.id"), nullable=True)
    perfil = relationship("Perfiles", back_populates="cursos")

    institucion_id = Column(Integer, ForeignKey("instituciones.id"), nullable=True)
    institucion = relationship("Instituciones", back_populates="cursos")

    vigencia = Column(String(200), nullable=True)
    contacto = Column(String(200), nullable=True)

    