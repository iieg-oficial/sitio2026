from sqlalchemy import Column, Integer, String, event
from app.core.database import Base

class DatosNuevos(Base):
    __tablename__ = "datos_nuevos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, nullable=False)
    descripcion = Column(String, nullable=False)
    slug = Column(String(200), nullable=False)

@event.listens_for(DatosNuevos, "before_insert")
def generate_slug(mapper, connection, target):
    target.slug = str(target.numero)  # slug = "123"
    target.slug = slugify(f"dato-{target.numero}")