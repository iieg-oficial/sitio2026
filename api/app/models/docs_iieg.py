import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum

from app.core.database import Base

class TipoDocsEnum(str, enum.Enum):
    valor = "valor"
    normatividad = "normatividad"
    plan_institucional = "plan_institucional"
    plan_de_trabajo = "plan_de_trabajo"
    

class DocsIIEG(Base):
    __tablename__ = "docs_iieg"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    tipo = Column(Enum(TipoDocsEnum), nullable=True)
    imagen = Column(String(255), nullable=True)
    link = Column(String(255), nullable=True)
    documento = Column(String(255), nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=True)
    slug = Column(String(255), nullable=False)