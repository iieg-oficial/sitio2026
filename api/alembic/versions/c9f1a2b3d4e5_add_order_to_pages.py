"""add order to pages

Revision ID: c9f1a2b3d4e5
Revises: 4cc71a6d42e6
Create Date: 2026-05-27 19:00:00.000000

"""
import sqlalchemy as sa
from alembic import op

revision = 'c9f1a2b3d4e5'
down_revision = '4cc71a6d42e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('pages')]
    
    parent_id_exists = 'parent_id' in columns
    partition_sql = "PARTITION BY parent_id " if parent_id_exists else ""
    
    op.execute(
        f"""
        WITH ranked_pages AS (
            SELECT id,
                ROW_NUMBER() OVER ({partition_sql}ORDER BY id) - 1 AS order_index
            FROM pages
        )
        UPDATE pages
        SET "order" = ranked_pages.order_index
        FROM ranked_pages
        WHERE pages.id = ranked_pages.id
        """
    )

    # 3. Limpiar cualquier NULL residual antes de aplicar NOT NULL
    op.execute('UPDATE pages SET "order" = 0 WHERE "order" IS NULL;')

    # 4. Modificar la columna especificando existing_type
    op.alter_column(
        'pages',
        'order',
        existing_type=sa.Integer(),
        nullable=False,
        server_default=sa.text('0')
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column['name'] for column in inspector.get_columns('pages')}
    if 'order' in columns:
        op.drop_column('pages', 'order')