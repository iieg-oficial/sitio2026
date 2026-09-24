"""remove_otro_from_tiposistemaenum

Revision ID: a7c9e22b8f4b
Revises: merge_90296bb12604_b2d3
Create Date: 2026-06-17
"""
import sqlalchemy as sa
from alembic import op

revision = 'a7c9e22b8f4b'
down_revision = 'merge_90296bb12604_b2d3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if not inspector.has_table('sistemas'):
        return

    # Verificar si la columna tipo existe en la tabla
    columns = {col['name'] for col in inspector.get_columns('sistemas')}
    if 'tipo' not in columns:
        return

    with op.get_context().autocommit_block():
        # 1. Crear el nuevo tipo temporal si no existe
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tiposistemaenum_new') THEN
                    CREATE TYPE tiposistemaenum_new AS ENUM ('plataforma', 'datos-recientes', 'estadistica');
                END IF;
            END$$;
            """
        )

        # 2. Migrar la columna al nuevo tipo
        op.execute(
            """
            ALTER TABLE sistemas 
            ALTER COLUMN tipo TYPE tiposistemaenum_new 
            USING (
                CASE tipo::text 
                    WHEN 'datos' THEN 'datos-recientes' 
                    WHEN 'otro' THEN 'estadistica' 
                    ELSE tipo::text 
                END
            )::tiposistemaenum_new
            """
        )

        # 3. Eliminar el tipo antiguo y renombrar el nuevo
        op.execute("DROP TYPE IF EXISTS tiposistemaenum")
        op.execute("ALTER TYPE tiposistemaenum_new RENAME TO tiposistemaenum")


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if not inspector.has_table('sistemas'):
        return

    columns = {col['name'] for col in inspector.get_columns('sistemas')}
    if 'tipo' not in columns:
        return

    with op.get_context().autocommit_block():
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tiposistemaenum_old') THEN
                    CREATE TYPE tiposistemaenum_old AS ENUM ('plataforma', 'datos', 'estadistica', 'otro');
                END IF;
            END$$;
            """
        )

        op.execute(
            "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_old USING tipo::text::tiposistemaenum_old"
        )
        op.execute("DROP TYPE IF EXISTS tiposistemaenum")
        op.execute("ALTER TYPE tiposistemaenum_old RENAME TO tiposistemaenum")