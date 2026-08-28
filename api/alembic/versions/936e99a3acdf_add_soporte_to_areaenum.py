"""add soporte to areaenum

Revision ID: 936e99a3acdf
Revises: a200006e9836
Create Date: 2026-08-28
"""

from alembic import op

revision = "936e99a3acdf"
down_revision = "a200006e9836"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("COMMIT")
    op.execute("ALTER TYPE areaenum ADD VALUE IF NOT EXISTS 'soporte'")


def downgrade() -> None:
    pass