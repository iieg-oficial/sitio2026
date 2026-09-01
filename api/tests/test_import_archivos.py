from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.models import Archivos, Subject
from scripts.import_generic_model_data import resolve_relationships


def test_resolve_relationships_accepts_subtemas_slugs_for_archivos():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    with Session() as db:
        root = Subject(titulo="Instrumentos", slug="instrumentos-de-control-y-consulta-archivistica")
        child = Subject(titulo="Fichas técnicas", slug="fichas-tecnicas-de-valoracion-documental", parent=root)
        db.add_all([root, child])
        db.commit()

        row = {
            "subtemas_slugs": "fichas-tecnicas-de-valoracion-documental",
        }

        relationships = resolve_relationships(db, Archivos, row)

        assert "temas" in relationships
        assert {item.slug for item in relationships["temas"]} == {"fichas-tecnicas-de-valoracion-documental"}
