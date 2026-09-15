"""add disabled to menu_items

Revision ID: e1f2a3b4c5d6
Revises: 3c59a2cbf559
Create Date: 2026-09-15

"""
import sqlalchemy as sa
from alembic import op

# Asegúrate de colocar como down_revision la ID del último script de migración en tu directorio
revision = 'e1f2a3b4c5d6'
down_revision = 'd7e8f9a0b1c2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('menu_items'):
        columns = {column['name'] for column in inspector.get_columns('menu_items')}
        if 'disabled' not in columns:
            op.add_column(
                'menu_items',
                sa.Column('disabled', sa.Boolean(), nullable=True, server_default=sa.text('false')),
            )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('menu_items'):
        columns = {column['name'] for column in inspector.get_columns('menu_items')}
        if 'disabled' in columns:
            op.drop_column('menu_items', 'disabled')