"""unificar_cabezas_migracion

Revision ID: df741a5e0869
Revises: ('e1f2a3b4c5d6', 'de655e1e2aa3')
Create Date: 2026-09-15 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'df741a5e0869'
down_revision = ('e1f2a3b4c5d6', 'de655e1e2aa3')
branch_labels = None
depends_on = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
