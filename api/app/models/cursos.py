import enum
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, Enum, Boolean, Table
from sqlalchemy.orm import relationship

from app.core.database import Base

curso_temas = Table(
    "curso_temas",
    Base.metadata,
    Column("curso_id", Integer, ForeignKey("cursos.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

curso_modulos = Table(
    "curso_modulos",
    Base.metadata,
    Column("curso_id", Integer, ForeignKey("cursos.id"), primary_key=True),
    Column("modulo_id", Integer, ForeignKey("modulos.id"), primary_key=True),
)

curso_instituciones = Table(
    "curso_instituciones",
    Base.metadata,
    Column("curso_id", Integer, ForeignKey("cursos.id"), primary_key=True),
    Column("institucion_id", Integer, ForeignKey("instituciones.id"), primary_key=True),
)

curso_perfiles = Table(
    "curso_perfiles",
    Base.metadata,
    Column("curso_id", Integer, ForeignKey("cursos.id"), primary_key=True),
    Column("perfil_id", Integer, ForeignKey("perfiles.id"), primary_key=True),
)

curso_profesores = Table(
    "curso_profesores",
    Base.metadata,
    Column("curso_id", Integer, ForeignKey("cursos.id"), primary_key=True),
    Column("profesor_id", Integer, ForeignKey("profesores.id"), primary_key=True),
)

class TipoCurso(enum.Enum):
    capacitacion = "capacitacion"
    convocatoria = "convocatoria"

class Cursos(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    img_portada = Column(String, nullable=True)
    inicio = Column(DateTime, default=datetime.utcnow, nullable=True)
    fin = Column(DateTime, default=datetime.utcnow, nullable=True)
    formato = Column(String(100), nullable=True)
    Horario = Column(String(100), nullable=True)
    Objetivo = Column(Text, nullable=True)
    p_ingreso = Column(Text, nullable=True)
    p_egreso = Column(Text, nullable=True)

    tipo_curso = Column(Enum(TipoCurso), nullable=False)
    destacado = Column(Boolean, default=False, nullable=True)

    inscripcion = Column(Text, nullable=True)
    acreditacion = Column(Text, nullable=True)

    vigencia = Column(String(200), nullable=True)
    contacto = Column(String(200), nullable=True)
    clave = Column(String(200), nullable=True)

    archivo = Column(String, nullable=True)
    formulario = Column(String, nullable=True)

    temas = relationship(
        "Subject",
        secondary=curso_temas,
        back_populates="cursos",
        lazy="selectin",
    )
    modulos = relationship("Modulos", secondary=curso_modulos, back_populates="cursos")
    instituciones = relationship("Instituciones", secondary=curso_instituciones, back_populates="cursos")
    perfiles = relationship("Perfiles", secondary=curso_perfiles, back_populates="cursos")
    profesores = relationship("Profesores", secondary=curso_profesores, back_populates="cursos")
    
    slug = Column(String(200), nullable=False)