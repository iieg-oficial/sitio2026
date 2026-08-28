"""merge_branches

Revision ID: 766a472366d5
Revises: 3c59a2cbf559, a9b8c7d6e5f4, b2c3d4e5f6a7
Create Date: 2026-08-27

"""
from alembic import op
import sqlalchemy as sa

revision = '766a472366d5'
down_revision = ('3c59a2cbf559', 'a9b8c7d6e5f4', 'b2c3d4e5f6a7')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
