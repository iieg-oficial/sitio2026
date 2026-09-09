"""add_estado_borrador

Revision ID: b5c6d7e8f9a0
Revises: f3a8b2c1d9e7
Create Date: 2026-02-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b5c6d7e8f9a0'
down_revision = 'ee37ba52b458'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE borradores ADD COLUMN IF NOT EXISTS estado VARCHAR "
        "NOT NULL DEFAULT 'en_progreso'"
    )
    op.execute(
        "ALTER TABLE borradores ADD COLUMN IF NOT EXISTS comentario_rechazo TEXT"
    )


def downgrade() -> None:
    op.drop_column('borradores', 'comentario_rechazo')
    op.drop_column('borradores', 'estado')
