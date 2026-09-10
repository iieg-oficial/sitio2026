"""add_must_change_password

Revision ID: 62523bba38ac
Revises: 001
Create Date: 2026-02-09 20:45:43.855701

"""
import sqlalchemy as sa

from alembic import op

revision = '62523bba38ac'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column['name'] for column in inspector.get_columns('usuarios')}
    if 'must_change_password' not in columns:
        op.add_column(
            'usuarios',
            sa.Column(
                'must_change_password',
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            ),
        )
        op.alter_column('usuarios', 'must_change_password', server_default=None)


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column['name'] for column in inspector.get_columns('usuarios')}
    if 'must_change_password' in columns:
        op.drop_column('usuarios', 'must_change_password')
