from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Subject(Base):
    __tablename__ = "subject"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)

    posts = relationship("Posts", back_populates="subject")
    archivos = relationship("Archivos", back_populates="subject")
    preguntas = relationship("Preguntas", back_populates="subject")
    flashes = relationship("Flashes", back_populates="subject")