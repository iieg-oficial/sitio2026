"""add_datos_nuevos_table

Revision ID: a1d2_add_datos_nuevos_table
Revises: f3a8b2c1d9e7
Create Date: 2026-06-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'a1d2_add_datos_nuevos_table'
down_revision = 'f3a8b2c1d9e7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use PostgreSQL ENUM without forcing type creation if it already exists
    nuevo_enum = postgresql.ENUM('sube', 'baja', 'igual', name='nuevoenum', create_type=False)

    op.create_table(
        'datos_nuevos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cifras', sa.String(length=200), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=False),
        sa.Column('slug', sa.String(length=200), nullable=False),
        sa.Column('tipo', postgresql.ENUM('sube', 'baja', 'igual', name='nuevoenum', create_type=False), nullable=True, server_default=sa.text("'igual'")),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_datos_nuevos_id'), 'datos_nuevos', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_datos_nuevos_id'), table_name='datos_nuevos')
    op.drop_table('datos_nuevos')

    nuevo_enum = sa.Enum('sube', 'baja', 'igual', name='nuevoenum')
    nuevo_enum.drop(op.get_bind(), checkfirst=True)
