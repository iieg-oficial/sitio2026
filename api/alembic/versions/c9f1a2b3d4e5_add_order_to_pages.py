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
    # 1. Crear la columna 'order' permitiendo nulos temporalmente
    op.add_column('pages', sa.Column('order', sa.Integer(), nullable=True))

    # 2. Calcular e insertar los índices por grupo (padres por un lado, subpáginas agrupadas por cada parent_id)
    op.execute(
        """
        WITH ranked_pages AS (
            SELECT 
                id,
                (ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY id) - 1)::integer AS order_index
            FROM pages
        )
        UPDATE pages
        SET "order" = ranked_pages.order_index
        FROM ranked_pages
        WHERE pages.id = ranked_pages.id;
        """
    )

    # 3. Ajustar la columna a NOT NULL con default 0 como especifica tu modelo
    op.alter_column('pages', 'order', nullable=False, server_default='0')


def downgrade() -> None:
    # Eliminar la columna 'order' al hacer rollback
    op.drop_column('pages', 'order')