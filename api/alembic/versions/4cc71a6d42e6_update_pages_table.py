"""update pages table

Revision ID: 4cc71a6d42e6
Revises: 6ef62c2a74a0
Create Date: 2026-05-27 16:02:50.046606

"""
import sqlalchemy as sa
from alembic import op

revision = '4cc71a6d42e6'
down_revision = '6ef62c2a74a0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('pages'):
        columns = {column['name'] for column in inspector.get_columns('pages')}
        if 'activar' not in columns:
            op.add_column('pages', sa.Column('activar', sa.Boolean(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('pages'):
        columns = {column['name'] for column in inspector.get_columns('pages')}
        if 'activar' in columns:
            op.drop_column('pages', 'activar')