"""crear_tabla_servicios

Revision ID: 4606b018ca46
Revises: f9801c36fde8
Create Date: 2026-10-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# --- DECLARACIÓN OBLIGATORIA (DEBEN IR EXACTAMENTE ASÍ) ---
revision = '4606b018ca46'
down_revision = 'f9801c36fde8'
branch_labels = None
depends_on = None
# ---------------------------------------------------------

tipo_servicio_enum = sa.Enum("Servicio", "Certificación", "Transparencia", name="tiposervicioenum")

def upgrade() -> None:
    # 1. Crear la tabla 'servicios' con id Integer autoincrementable
    op.create_table(
        "servicios",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("codigo", sa.String(length=200), nullable=True),
        sa.Column("tipo", tipo_servicio_enum, nullable=False),
        sa.Column("titulo", sa.String(length=200), nullable=False),
        sa.Column("formato_entrega", sa.String(length=200), nullable=True),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("unidad_medida", sa.String(length=200), nullable=True),
        sa.Column("costos", sa.String(length=200), nullable=True),
        sa.Column("politicas", sa.Text(), nullable=True),
        sa.Column("slug", sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint("id")
    )
    # 2. Crear índices
    op.create_index(op.f("ix_servicios_id"), "servicios", ["id"], unique=False)

def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS servicios_id_seq;")
    op.execute("ALTER TABLE servicios ALTER COLUMN id TYPE INTEGER USING id::integer;")
    op.execute("ALTER TABLE servicios ALTER COLUMN id SET DEFAULT nextval('servicios_id_seq');")
    op.execute("ALTER SEQUENCE servicios_id_seq OWNED BY servicios.id;")
    op.execute("SELECT setval('servicios_id_seq', COALESCE((SELECT MAX(id) FROM servicios), 1));")

def downgrade() -> None:
    op.execute("ALTER TABLE servicios ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS servicios_id_seq;")
    op.execute("ALTER TABLE servicios ALTER COLUMN id TYPE VARCHAR(200) USING id::varchar;")
