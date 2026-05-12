from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, JSON, String, Text

from app.core.database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    slug_custom = Column(String, nullable=False)
    description_meta = Column(Text, nullable=True)
    keywords_meta = Column(String, nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    slug = Column(String(200), nullable=False)
