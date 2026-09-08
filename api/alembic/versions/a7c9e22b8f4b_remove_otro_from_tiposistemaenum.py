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

    if 'sistemas' not in inspector.get_table_names():
        return

    op.execute("CREATE TYPE tiposistemaenum_new AS ENUM ('plataforma', 'datos-recientes', 'estadistica')")
    op.execute(
        "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_new USING (CASE tipo::text WHEN 'datos' THEN 'datos-recientes' WHEN 'otro' THEN 'estadistica' ELSE tipo::text END)::tiposistemaenum_new"
    )
    op.execute("DROP TYPE tiposistemaenum")
    op.execute("ALTER TYPE tiposistemaenum_new RENAME TO tiposistemaenum")


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if 'sistemas' not in inspector.get_table_names():
        return

    op.execute("CREATE TYPE tiposistemaenum_old AS ENUM ('plataforma', 'datos', 'estadistica', 'otro')")
    op.execute(
        "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_old USING tipo::text::tiposistemaenum_old"
    )
    op.execute("DROP TYPE tiposistemaenum")
    op.execute("ALTER TYPE tiposistemaenum_old RENAME TO tiposistemaenum")
