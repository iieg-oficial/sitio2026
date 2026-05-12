from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, Boolean

from app.core.database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    link_interno = Column(Boolean, default=True, nullable=True)    
    slug_custom = Column(String, nullable=False)
    description_meta = Column(Text, nullable=True)
    keywords_meta = Column(String, nullable=True)    
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    slug = Column(String(200), nullable=False)
