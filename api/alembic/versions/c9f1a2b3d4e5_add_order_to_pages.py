"""add order to pages

Revision ID: c9f1a2b3d4e5
Revises: <ID_DE_TU_MIGRACION_ANTERIOR>
Create Date: 2026-09-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9f1a2b3d4e5'
down_revision: Union[str, None] = '<ID_DE_TU_MIGRACION_ANTERIOR>'  # Reemplaza por el hash previo
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Inspeccionar la tabla para verificar si existe la columna parent_id
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [col['name'] for col in inspector.get_columns('pages')]

    # 2. Agregar la columna 'order' permitiendo valores nulos temporalmente
    if 'order' not in existing_columns:
        op.add_column('pages', sa.Column('order', sa.Integer(), nullable=True))

    # 3. Determinar si se agrupa por parent_id o de forma global
    has_parent_id = 'parent_id' in existing_columns
    partition_clause = "PARTITION BY parent_id" if has_parent_id else ""

    # 4. Poblar la columna 'order' mediante la CTE
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
        WHERE pages.id = ranked_pages.id;
        """
    )

    # 5. (Opcional) Convertir la columna 'order' a NOT NULL y asignar default 0
    op.alter_column('pages', 'order', nullable=False, server_default='0')


def downgrade() -> None:
    # Eliminar la columna 'order' al hacer rollback
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [col['name'] for col in inspector.get_columns('pages')]

    if 'order' in existing_columns:
        op.drop_column('pages', 'order')