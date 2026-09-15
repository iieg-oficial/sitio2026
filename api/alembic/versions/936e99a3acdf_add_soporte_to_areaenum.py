"""add soporte to areaenum

Revision ID: 936e99a3acdf
Revises: 766a472366d5
Create Date: 2026-08-28 00:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

revision = '936e99a3acdf'
down_revision = '766a472366d5'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()

    with op.get_context().autocommit_block():
        # Verificar si el enum existe
        enum_exists = bool(
            bind.execute(
                sa.text("SELECT 1 FROM pg_type WHERE typname = 'areaenum'")
            ).scalar()
        )

        if enum_exists:
            op.execute("ALTER TYPE areaenum ADD VALUE IF NOT EXISTS 'soporte'")
        else:
            op.execute("CREATE TYPE areaenum AS ENUM ('soporte')")


def downgrade():
    pass