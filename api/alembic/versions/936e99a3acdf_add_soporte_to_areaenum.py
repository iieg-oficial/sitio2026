"""add soporte to areaenum

Revision ID: 936e99a3acdf
Revises: 766a472366d5
Create Date: 2026-08-28 00:00:00.000000

"""

from alembic import op

revision = '936e99a3acdf'
down_revision = '766a472366d5'
branch_labels = None
depends_on = None


def upgrade():
    # En PostgreSQL, ALTER TYPE ADD VALUE no se puede ejecutar dentro de un bloque de transacción explícito
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE areaenum ADD VALUE IF NOT EXISTS 'soporte';")


def downgrade():
    # Eliminar valores de un tipo ENUM no es directo ni seguro en PostgreSQL si hay registros usándolo.
    pass