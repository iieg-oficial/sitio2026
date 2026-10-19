"""add token_version to usuarios

Revision ID: f9801c36fde8
Revises: de655e1e2aa3
Create Date: 2026-10-01 20:29:58.125350

"""
from alembic import op
import sqlalchemy as sa


revision = 'f9801c36fde8'
down_revision = ('e1f2a3b4c5d6', 'de655e1e2aa3')
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "usuarios",
        sa.Column("token_version", sa.Integer(), server_default="0", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("usuarios", "token_version")
