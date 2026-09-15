"""agregar campo video al blog

Revision ID: 46966bef146e
Revises: 3a3bab96269b
Create Date: 2026-07-16 19:00:05.051409

"""
import sqlalchemy as sa

from alembic import op

revision = '46966bef146e'
down_revision = '3a3bab96269b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('posts'):
        columns = {column['name'] for column in inspector.get_columns('posts')}
        if 'video' not in columns:
            op.add_column('posts', sa.Column('video', sa.String(length=200), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('posts'):
        columns = {column['name'] for column in inspector.get_columns('posts')}
        if 'video' in columns:
            op.drop_column('posts', 'video')