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
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Validar que la tabla exista antes de obtener sus columnas
    if inspector.has_table('cursos'):
        columns = {column['name'] for column in inspector.get_columns('cursos')}
        if 'img_portada' not in columns:
            op.add_column('cursos', sa.Column('img_portada', sa.String(255), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('cursos'):
        columns = {column['name'] for column in inspector.get_columns('cursos')}
        if 'img_portada' in columns:
            op.drop_column('cursos', 'img_portada')