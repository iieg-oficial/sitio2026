"""crear_tabla_servicios

Revision ID: 4606b018ca46
Revises: f9801c36fde8
Create Date: 2026-10-20
"""
from alembic import op
import sqlalchemy as sa

# --- DECLARACIÓN OBLIGATORIA (DEBEN IR EXACTAMENTE ASÍ) ---
revision = '4606b018ca46'
down_revision = 'f9801c36fde8'
branch_labels = None
depends_on = None
# ---------------------------------------------------------

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