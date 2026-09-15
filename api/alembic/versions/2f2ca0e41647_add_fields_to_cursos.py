"""add fields to cursos

Revision ID: 2f2ca0e41647
Revises: 4f4c8ef54726
Create Date: 2026-07-02 20:25:00.479321

"""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = '2f2ca0e41647'
down_revision = '4f4c8ef54726'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1. Modificar tabla 'cursos' solo si existe
    if inspector.has_table('cursos'):
        cursos_columns = {
            column['name'] for column in inspector.get_columns('cursos')
        }
        if 'archivo' not in cursos_columns:
            op.add_column('cursos', sa.Column('archivo', sa.String(), nullable=True))
        if 'formulario' not in cursos_columns:
            op.add_column('cursos', sa.Column('formulario', sa.String(), nullable=True))

    # 2. Modificar tabla 'documentacion' solo si existe
    if inspector.has_table('documentacion'):
        op.alter_column(
            'documentacion', 
            'tipo',
            existing_type=postgresql.ENUM('metodologia', 'codigo', 'manual', name='tipoenum'),
            nullable=True
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('documentacion'):
        op.alter_column(
            'documentacion', 
            'tipo',
            existing_type=postgresql.ENUM('metodologia', 'codigo', 'manual', name='tipoenum'),
            nullable=False
        )

    if inspector.has_table('cursos'):
        cursos_columns = {
            column['name'] for column in inspector.get_columns('cursos')
        }
        if 'formulario' in cursos_columns:
            op.drop_column('cursos', 'formulario')
        if 'archivo' in cursos_columns:
            op.drop_column('cursos', 'archivo')