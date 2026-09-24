"""reconcilia esquema con modelos

Revision ID: 3c59a2cbf559
Revises: 6e5f4fe49b6c
Create Date: 2026-08-06 23:13:52.100302

"""
import sqlalchemy as sa
from alembic import op

revision = '3c59a2cbf559'
down_revision = '6e5f4fe49b6c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1. Procesar 'docs_iieg'
    if inspector.has_table('docs_iieg'):
        docs_columns = {column['name']: column for column in inspector.get_columns('docs_iieg')}
        if 'descripcion' in docs_columns and not docs_columns['descripcion']['nullable']:
            op.alter_column('docs_iieg', 'descripcion', existing_type=sa.TEXT(), nullable=True)

    # 2. Procesar 'preguntas'
    if inspector.has_table('preguntas'):
        preguntas_columns = {column['name']: column for column in inspector.get_columns('preguntas')}
        if 'slug' in preguntas_columns and not preguntas_columns['slug']['nullable']:
            op.alter_column('preguntas', 'slug', existing_type=sa.VARCHAR(length=200), nullable=True)

    # 3. Procesar 'sistemas'
    if inspector.has_table('sistemas'):
        sistemas_columns = {column['name']: column for column in inspector.get_columns('sistemas')}
        if 'slider' not in sistemas_columns:
            op.add_column('sistemas', sa.Column('slider', sa.Boolean(), nullable=True))
        if 'imagen_slider' not in sistemas_columns:
            op.add_column('sistemas', sa.Column('imagen_slider', sa.String(), nullable=True))
        if 'slug' in sistemas_columns and not sistemas_columns['slug']['nullable']:
            op.alter_column('sistemas', 'slug', existing_type=sa.VARCHAR(length=200), nullable=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('sistemas'):
        sistemas_columns = {column['name'] for column in inspector.get_columns('sistemas')}
        if 'slug' in sistemas_columns:
            op.alter_column('sistemas', 'slug', existing_type=sa.VARCHAR(length=200), nullable=False)
        if 'imagen_slider' in sistemas_columns:
            op.drop_column('sistemas', 'imagen_slider')
        if 'slider' in sistemas_columns:
            op.drop_column('sistemas', 'slider')

    if inspector.has_table('preguntas'):
        preguntas_columns = {column['name'] for column in inspector.get_columns('preguntas')}
        if 'slug' in preguntas_columns:
            op.alter_column('preguntas', 'slug', existing_type=sa.VARCHAR(length=200), nullable=False)

    if inspector.has_table('docs_iieg'):
        docs_columns = {column['name'] for column in inspector.get_columns('docs_iieg')}
        if 'descripcion' in docs_columns:
            op.alter_column('docs_iieg', 'descripcion', existing_type=sa.TEXT(), nullable=False)