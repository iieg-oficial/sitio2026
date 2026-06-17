"""merge zz_add_datos_recientes and ffcbb95dc8bb

Revision ID: merge_zz_ffcbb
Revises: zz_add_datos_recientes, ffcbb95dc8bb
Create Date: 2026-06-17
"""
from alembic import op

revision = 'merge_zz_ffcbb'
down_revision = ('zz_add_datos_recientes', 'ffcbb95dc8bb')
branch_labels = None
depends_on = None


def upgrade() -> None:
    # merge-only revision: no DB changes
    pass


def downgrade() -> None:
    pass
