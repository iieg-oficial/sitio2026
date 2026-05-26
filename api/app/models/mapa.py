import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Enum
from app.core.database import Base

class TipoMapaEnum(str, enum.Enum):
    separado = "Mapa separado"
    atlas = "Atlas mapa"
    libro = "Mapa de libro"
    compuesto = "Mapa Compuesto"
    casos = "Mapa de casos"
    bolsillo = "Mapa de bolsillo"
    monumento_hipsografico = "Monumento Hipsográfico"
    atlas_catastral_jalisco = "Atlas Catastral de Jalisco"
    plano_separado = "Plano separado"
    mapa_grafico = "Mapa gráfico"
    carta_topografica = "Carta Topográfica"
    carta_geologica = "Carta Geológica"
    carta_frontera_agricola = "Carta Frontera Agrícola"
    carta_uso_suelo_vegetacion = "Carta Uso de Suelo y Vegetación"
    edicion_bolsillo_1er = "Edición de bolsillo, 1er"
    carta_municipal = "Carta Municipal"
    mapa_general = "Mapa General"
    carta_general = "Carta General"

class Mapa(Base):
    __tablename__ = "mapa"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    tipo = Column(Enum(TipoMapaEnum), nullable=True)
    autor = Column(String, nullable=True)
    anyo = Column(Integer, nullable=True)
    area = Column(String, nullable=True)
    editor = Column(String, nullable=True)
    medida = Column(String, nullable=True)
    escala = Column(String, nullable=True)    
    edicion = Column(Text, nullable=True)
    ubicacion = Column(String, nullable=True)    
    sitio_web = Column(String, nullable=True)    
    informacion = Column(Text, nullable=True)
    imagen = Column(String, nullable=True)
    archivo = Column(String, nullable=True)
    slug = Column(String(200), nullable=False)
    