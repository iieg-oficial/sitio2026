from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

pregunta_temas = Table(
    "pregunta_temas",
    Base.metadata,
    Column("pregunta_id", Integer, ForeignKey("preguntas.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class Preguntas(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    pregunta = Column(String(255), nullable=False)
    respuesta = Column(Text, nullable=False)
    slug = Column(String(200), nullable=False)

    temas = relationship(
        "Subject",
        secondary=pregunta_temas,
        back_populates="preguntas",
        lazy="selectin",
    )