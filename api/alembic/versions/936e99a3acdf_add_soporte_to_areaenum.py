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
    op.execute("ALTER TYPE areaenum ADD VALUE IF NOT EXISTS 'soporte';")


def downgrade():
    # Downgrading an enum value is not straightforward in Postgres and
    # may not be safe if rows use the value. No-op here.
    pass
