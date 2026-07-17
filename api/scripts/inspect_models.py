import sys
from pathlib import Path

sys.path.append(str(Path('/home/isabel-perez/portales/sitio2026/api')))

from app.core.database import SessionLocal
from app.models import Base
from sqlalchemy import inspect
import app.models

models = [
    "Usuario", "Page", "MenuItem", "Media", "MediaFolder", "Borrador",
    "Posts", "Subject", "DatosNuevos", "Flashes", "Mapa", "Directorio",
    "Organos", "Archivos", "Snieg", "Preguntas", "Sistemas", "Reportes",
    "Documentacion", "Profesores", "Instituciones", "Modulos", "Perfiles",
    "Cursos", "DocsIIEG", "Banner", "Cuadernillo"
]

for m in models:
    cls = getattr(app.models, m, None)
    if not cls: continue
    mapper = inspect(cls)
    cols = [c.name for c in mapper.columns if not (c.primary_key and c.autoincrement)]
    rels = [f"{r.key}_slugs" for r in mapper.relationships if r.uselist]
    print(f"[{m}]")
    print("Cols:", ",".join(cols))
    print("Rels:", ",".join(rels))
    print()
