from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, JSON, String, Text

from app.core.database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(String, unique=True, nullable=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    slug_custom = Column(String, nullable=False)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    slug = Column(String(200), nullable=False)
