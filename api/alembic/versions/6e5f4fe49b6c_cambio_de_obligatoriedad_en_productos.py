"""cambio de obligatoriedad en productos

Revision ID: 6e5f4fe49b6c
Revises: 46966bef146e
Create Date: 2026-07-17 18:59:10.016648

"""
import sqlalchemy as sa
from alembic import op

revision = '6e5f4fe49b6c'
down_revision = '46966bef146e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('sistemas'):
        columns = {column['name']: column for column in inspector.get_columns('sistemas')}
        if 'link' in columns and not columns['link']['nullable']:
            op.alter_column('sistemas', 'link', existing_type=sa.VARCHAR(), nullable=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('sistemas'):
        columns = {column['name'] for column in inspector.get_columns('sistemas')}
        if 'link' in columns:
            op.alter_column('sistemas', 'link', existing_type=sa.VARCHAR(), nullable=False)