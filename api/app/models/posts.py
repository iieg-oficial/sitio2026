from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Posts(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    resumen = Column(String(300))
    contenido = Column(Text, nullable=False)
    autor = Column(String(100), default="IIEG")
    fecha = Column(DateTime, default=datetime.utcnow)
    keywords = Column(String(200))
    slug = Column(String(200), nullable=False)

    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=True)
    subject = relationship("Subject", back_populates="posts")