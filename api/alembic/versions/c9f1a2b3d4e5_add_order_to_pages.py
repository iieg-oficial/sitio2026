"""add order to pages

Revision ID: c9f1a2b3d4e5
Revises: 4cc71a6d42e6
Create Date: 2026-05-27 19:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'c9f1a2b3d4e5'
down_revision = '4cc71a6d42e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('pages', sa.Column('order', sa.Integer(), nullable=True))

    # Assign a stable order inside each sibling group.
    op.execute(
        """
        WITH ranked_pages AS (
            SELECT id,
                   ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY id) - 1 AS order_index
            FROM pages
        )
        UPDATE pages
        SET "order" = ranked_pages.order_index
        FROM ranked_pages
        WHERE pages.id = ranked_pages.id
        """
    )

    op.alter_column('pages', 'order', nullable=False, server_default='0')


def downgrade() -> None:
    op.drop_column('pages', 'order')
