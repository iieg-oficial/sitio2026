"""add img_portada to cursos

Revision ID: a9b8c7d6e5f4
Revises: ffcbb95dc8bb
Create Date: 2026-08-24 18:40:00.000000

"""
import sqlalchemy as sa

from alembic import op

revision = 'a9b8c7d6e5f4'
down_revision = 'ffcbb95dc8bb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column['name'] for column in inspector.get_columns('cursos')}
    if 'img_portada' not in columns:
        op.add_column('cursos', sa.Column('img_portada', sa.String(), nullable=True))


def downgrade() -> None:
    # remove img_portada column from cursos
    op.drop_column('cursos', 'img_portada')
