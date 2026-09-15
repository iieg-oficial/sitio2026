"""add order to pages

Revision ID: c9f1a2b3d4e5
Revises: 4cc71a6d42e6
Create Date: 2026-05-27 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision = 'c9f1a2b3d4e5'
down_revision = '4cc71a6d42e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('pages')]

    # 1. Crear la columna 'order' solo si no existe
    if 'order' not in columns:
        op.add_column('pages', sa.Column('order', sa.Integer(), nullable=True))

    # 2. Verificar si parent_id existe físicamente en PostgreSQL
    has_parent_id = 'parent_id' in columns
    partition_clause = "PARTITION BY parent_id" if has_parent_id else ""

    # 3. Executar UPDATE ordenando con o sin partición según la presencia de parent_id
    op.execute(
        f"""
        WITH ranked_pages AS (
            SELECT 
                id,
                (ROW_NUMBER() OVER ({partition_clause} ORDER BY id) - 1)::integer AS order_index
            FROM pages
        )
        UPDATE pages
        SET "order" = ranked_pages.order_index
        FROM ranked_pages
        WHERE pages.id = ranked_pages.id
        """
    )

    # 4. Ajustar la columna a NOT NULL
    op.alter_column('pages', 'order', nullable=False, server_default='0')


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('pages')]

    if 'order' in columns:
        op.drop_column('pages', 'order')