from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Subject(Base):
    __tablename__ = "subject"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey("subject.id"), nullable=True)
    slug = Column(String(200), nullable=False)

    parent = relationship("Subject", remote_side=[id], back_populates="subtemas")
    subtemas = relationship(
        "Subject",
        back_populates="parent",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    # Relaciones con otros modelos (many-to-many o FK en el otro lado)
    posts = relationship("Posts", back_populates="subject")
    archivos = relationship("Archivos", secondary="archivo_temas", back_populates="temas")
    preguntas = relationship("Preguntas", secondary="pregunta_temas", back_populates="temas")
    flashes = relationship("Flashes", secondary="flash_temas", back_populates="temas")
    reportes = relationship("Reportes", secondary="reporte_temas", back_populates="temas")
    documentacion = relationship("Documentacion", secondary="documentacion_temas", back_populates="temas")