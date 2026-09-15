"""add new field to cursos

Revision ID: 00f82b7c5def
Revises: 1093bbecf06f
Create Date: 2026-07-08 22:39:56.565971

"""
import sqlalchemy as sa

from alembic import op

revision = '00f82b7c5def'
down_revision = '1093bbecf06f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Solo inspeccionar e insertar la columna si la tabla 'cursos' existe en la BD
    if inspector.has_table('cursos'):
        columns = {column['name'] for column in inspector.get_columns('cursos')}
        if 'fin' not in columns:
            op.add_column('cursos', sa.Column('fin', sa.DateTime(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('cursos'):
        columns = {column['name'] for column in inspector.get_columns('cursos')}
        if 'fin' in columns:
            op.drop_column('cursos', 'fin')