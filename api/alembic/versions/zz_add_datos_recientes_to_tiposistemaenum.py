"""add_datos_recientes_to_tiposistemaenum

Revision ID: zz_add_datos_recientes
Revises: a7c9e22b8f4b
Create Date: 2026-06-17
"""
from alembic import op
import sqlalchemy as sa

revision = 'zz_add_datos_recientes'
down_revision = 'a7c9e22b8f4b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if 'sistemas' not in inspector.get_table_names():
        return

    # Create an intermediate enum that contains both old and new labels
    op.execute(
        "CREATE TYPE tiposistemaenum_new AS ENUM ('plataforma', 'datos', 'datos-recientes', 'estadistica')"
    )

    # Move the column to the intermediate enum
    op.execute(
        "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_new USING tipo::text::tiposistemaenum_new"
    )

    # Update rows that used the old 'datos' label to the new 'datos-recientes'
    op.execute("UPDATE sistemas SET tipo = 'datos-recientes' WHERE tipo = 'datos'")

    # Create the final enum without the old 'datos' label
    op.execute(
        "CREATE TYPE tiposistemaenum_final AS ENUM ('plataforma', 'datos-recientes', 'estadistica')"
    )

    # Convert the column to the final enum
    op.execute(
        "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_final USING tipo::text::tiposistemaenum_final"
    )

    # Cleanup: drop intermediate and replace original
    op.execute("DROP TYPE tiposistemaenum_new")
    # Drop the old type if it exists, then rename final to the canonical name
    op.execute("DROP TYPE IF EXISTS tiposistemaenum")
    op.execute("ALTER TYPE tiposistemaenum_final RENAME TO tiposistemaenum")


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if 'sistemas' not in inspector.get_table_names():
        return

    # Recreate the old enum with 'datos'
    op.execute("CREATE TYPE tiposistemaenum_old AS ENUM ('plataforma', 'datos', 'estadistica')")
    op.execute(
        "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_old USING tipo::text::tiposistemaenum_old"
    )
    op.execute("DROP TYPE tiposistemaenum")
    op.execute("ALTER TYPE tiposistemaenum_old RENAME TO tiposistemaenum")
