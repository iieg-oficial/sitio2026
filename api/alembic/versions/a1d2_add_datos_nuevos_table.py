"""add_datos_nuevos_table

Revision ID: a1d2_add_datos_nuevos_table
Revises: f3a8b2c1d9e7
Create Date: 2026-06-08

"""

from alembic import op

revision = 'a1d2_add_datos_nuevos_table'
down_revision = 'f3a8b2c1d9e7'
branch_labels = None
depends_on = None


def upgrade() -> None:
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
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS datos_nuevos (
            id SERIAL NOT NULL,
            cifras VARCHAR(200) NOT NULL,
            descripcion TEXT NOT NULL,
            slug VARCHAR(200) NOT NULL,
            tipo nuevoenum DEFAULT 'igual',
            PRIMARY KEY (id)
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_datos_nuevos_id ON datos_nuevos (id);")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_datos_nuevos_id;")
    op.execute("DROP TABLE IF EXISTS datos_nuevos;")
    op.execute("DROP TYPE IF EXISTS nuevoenum;")
