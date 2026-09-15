"""add_datos_recientes_to_tiposistemaenum

Revision ID: zz_add_datos_recientes
Revises: a7c9e22b8f4b
Create Date: 2026-06-17
"""
import sqlalchemy as sa
from alembic import op

revision = 'zz_add_datos_recientes'
down_revision = 'a7c9e22b8f4b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if not inspector.has_table('sistemas'):
        return

    columns = {col['name'] for col in inspector.get_columns('sistemas')}
    if 'tipo' not in columns:
        return

    with op.get_context().autocommit_block():
        # 1. Crear tipo intermedio
        op.execute("DROP TYPE IF EXISTS tiposistemaenum_new")
        op.execute(
            "CREATE TYPE tiposistemaenum_new AS ENUM ('plataforma', 'datos', 'datos-recientes', 'estadistica')"
        )

        # 2. Migrar la columna al tipo intermedio
        op.execute(
            "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_new USING tipo::text::tiposistemaenum_new"
        )

        # 3. Actualizar registros antiguos
        op.execute("UPDATE sistemas SET tipo = 'datos-recientes' WHERE tipo = 'datos'")

        # 4. Crear el tipo final sin la etiqueta obsoleta
        op.execute("DROP TYPE IF EXISTS tiposistemaenum_final")
        op.execute(
            "CREATE TYPE tiposistemaenum_final AS ENUM ('plataforma', 'datos-recientes', 'estadistica')"
        )

        # 5. Convertir columna al tipo final y limpiar
        op.execute(
            "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_final USING tipo::text::tiposistemaenum_final"
        )

        op.execute("DROP TYPE IF EXISTS tiposistemaenum_new")
        op.execute("DROP TYPE IF EXISTS tiposistemaenum")
        op.execute("ALTER TYPE tiposistemaenum_final RENAME TO tiposistemaenum")


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if not inspector.has_table('sistemas'):
        return

    columns = {col['name'] for col in inspector.get_columns('sistemas')}
    if 'tipo' not in columns:
        return

    with op.get_context().autocommit_block():
        op.execute("DROP TYPE IF EXISTS tiposistemaenum_old")
        op.execute("CREATE TYPE tiposistemaenum_old AS ENUM ('plataforma', 'datos', 'estadistica')")
        
        op.execute(
            "ALTER TABLE sistemas ALTER COLUMN tipo TYPE tiposistemaenum_old USING tipo::text::tiposistemaenum_old"
        )
        
        op.execute("DROP TYPE IF EXISTS tiposistemaenum")
        op.execute("ALTER TYPE tiposistemaenum_old RENAME TO tiposistemaenum")