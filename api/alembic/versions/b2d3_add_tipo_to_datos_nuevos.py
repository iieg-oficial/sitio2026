"""add_tipo_to_datos_nuevos

Revision ID: b2d3_add_tipo_to_datos_nuevos
Revises: a1d2_add_datos_nuevos_table
Create Date: 2026-06-08

"""
from alembic import op
import sqlalchemy as sa


revision = 'b2d3_add_tipo_to_datos_nuevos'
down_revision = 'a1d2_add_datos_nuevos_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # create enum type if it doesn't exist
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nuevoenum') THEN
            CREATE TYPE nuevoenum AS ENUM ('sube','baja','igual');
        END IF;
    END$$;
    """)

    # add column tipo if not exists with default 'igual'
    op.execute("ALTER TABLE datos_nuevos ADD COLUMN IF NOT EXISTS tipo nuevoenum DEFAULT 'igual';")


def downgrade() -> None:
    # remove column if exists
    op.execute("ALTER TABLE datos_nuevos DROP COLUMN IF EXISTS tipo;")
    # drop enum type if exists (may fail if used elsewhere)
    op.execute("DROP TYPE IF EXISTS nuevoenum;")
