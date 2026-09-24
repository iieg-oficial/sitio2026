"""add_tipo_to_datos_nuevos

Revision ID: b2d3_add_tipo_to_datos_nuevos
Revises: a1d2_add_datos_nuevos_table
Create Date: 2026-06-08

"""
import sqlalchemy as sa
from alembic import op

revision = 'b2d3_add_tipo_to_datos_nuevos'
down_revision = 'a1d2_add_datos_nuevos_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1. Crear tipo ENUM en bloque autocommit por compatibilidad con PostgreSQL
    with op.get_context().autocommit_block():
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nuevoenum') THEN
                    CREATE TYPE nuevoenum AS ENUM ('sube', 'baja', 'igual');
                END IF;
            END$$;
            """
        )

    # 2. Agregar la columna solo si la tabla existe
    if inspector.has_table('datos_nuevos'):
        op.execute("ALTER TABLE datos_nuevos ADD COLUMN IF NOT EXISTS tipo nuevoenum DEFAULT 'igual';")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('datos_nuevos'):
        op.execute("ALTER TABLE datos_nuevos DROP COLUMN IF EXISTS tipo;")
    
    with op.get_context().autocommit_block():
        op.execute("DROP TYPE IF EXISTS nuevoenum;")