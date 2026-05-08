from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.core.database import Base

post_temas = Table(
    "post_temas",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class Posts(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    resumen = Column(Text)
    contenido = Column(Text, nullable=False)
    autor = Column(String(100), default="IIEG")
    fecha = Column(DateTime, default=datetime.utcnow)
    claves = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=False)

    temas = relationship(
        "Subject",
        secondary=post_temas,
        back_populates="posts",
        lazy="selectin",
    )