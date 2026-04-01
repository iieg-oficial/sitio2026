from sqlalchemy import Column, Integer, String, ForeignKey
from .media import Media
from app.core.database import Base
from sqlalchemy.orm import relationship

class Configuracion(Base):
    __tablename__ = "configuraciones"

    nombre = Column(String, nullable=False)
    facebook = Column(String, nullable=False)
    twitter = Column(String, nullable=False)
    instagram = Column(String, nullable=False)
    youtube = Column(String, nullable=False)
    transparencia_url = Column(String, nullable=False)  
    transparencia_img = Column(Integer, ForeignKey("media.id"), nullable=True)
    logo = Column(Integer, ForeignKey("media.id"), nullable=True)

    logo_media = relationship("Media", foreign_keys=[logo])
    transparencia_media = relationship("Media", foreign_keys=[transparencia_img])