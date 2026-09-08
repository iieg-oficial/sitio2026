from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    link_interno = Column(Boolean, default=True, nullable=True)
    activar = Column(Boolean, default=True, nullable=True)
    slug_custom = Column(String, nullable=False)
    description_meta = Column(Text, nullable=True)
    keywords_meta = Column(String, nullable=True)
    order = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    slug = Column(String(200), nullable=False)

    parent_id = Column(Integer, ForeignKey("pages.id"), nullable=True)
    parent = relationship("Page", remote_side=[id], back_populates="subpages")
    subpages = relationship(
        "Page",
        back_populates="parent",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
