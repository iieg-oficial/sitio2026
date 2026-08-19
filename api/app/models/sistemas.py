import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Table, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

sistema_temas = Table(
    "sistema_temas",
    Base.metadata,
    Column("sistema_id", Integer, ForeignKey("sistemas.id"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subject.id"), primary_key=True),
)

class TipoSistemaEnum(str, enum.Enum):
    plataforma = "plataforma"
    datos_recientes = "datos-recientes"
    estadistica = "estadistica"

    @property
    def label(self) -> str:
        labels = {
            TipoSistemaEnum.plataforma: "Plataforma interactiva",
            TipoSistemaEnum.datos_recientes: "Los datos más nuevos",
            TipoSistemaEnum.estadistica: "Estadística experimental",
        }
        return labels.get(self, self.value)

class Sistemas(Base):
    __tablename__ = "sistemas"

    id = Column(Integer, primary_key=True, index=True)  
    titulo = Column(String, nullable=False)
    descripcion = Column(Text, nullable=False)
    link = Column(String, nullable=True)
    tipo = Column(
        Enum(
            TipoSistemaEnum,
            values_callable=lambda obj: [e.value for e in obj],
            name="tiposistemaenum",
        ),
        nullable=False,
    )
    imagen = Column(String, nullable=True)
    claves = Column(String(200), nullable=True)
    slug = Column(String(200), nullable=True)
    destacado = Column(Boolean, default=False, nullable=True)
    slider = Column(Boolean, default=False, nullable=True)
    imagen_slider = Column(String, nullable=True)
    orden = Column(Integer, default=0, nullable=True)

    temas = relationship(
        "Subject",
        secondary=sistema_temas,
        back_populates="sistemas",
        lazy="selectin",
    )

    documentacion = relationship("Documentacion", secondary="documentacion_sistemas", back_populates="sistemas")
    