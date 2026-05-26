"""add mapas table

Revision ID: 6ef62c2a74a0
Revises: a1b2c3d4e5f6
Create Date: 2026-05-26 17:34:39.342458

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '6ef62c2a74a0'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


tipomapaenum = postgresql.ENUM(
    'separado', 'atlas', 'libro', 'compuesto', 'casos', 'bolsillo',
    'monumento_hipsografico', 'atlas_catastral_jalisco', 'plano_separado',
    'mapa_grafico', 'carta_topografica', 'carta_geologica',
    'carta_frontera_agricola', 'carta_uso_suelo_vegetacion',
    'edicion_bolsillo_1er', 'carta_municipal', 'mapa_general',
    'carta_general',
    name='tipomapaenum',
)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    tipomapaenum.create(bind, checkfirst=True)

    if 'mapa' not in inspector.get_table_names():
        op.create_table(
            'mapa',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('titulo', sa.String(), nullable=False),
            sa.Column('tipo', tipomapaenum, nullable=True),
            sa.Column('autor', sa.String(), nullable=True),
            sa.Column('anyo', sa.Integer(), nullable=True),
            sa.Column('area', sa.String(), nullable=True),
            sa.Column('editor', sa.String(), nullable=True),
            sa.Column('medida', sa.String(), nullable=True),
            sa.Column('escala', sa.String(), nullable=True),
            sa.Column('edicion', sa.Text(), nullable=True),
            sa.Column('ubicacion', sa.String(), nullable=True),
            sa.Column('sitio_web', sa.String(), nullable=True),
            sa.Column('informacion', sa.Text(), nullable=True),
            sa.Column('imagen', sa.String(), nullable=True),
            sa.Column('archivo', sa.String(), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_mapa_id'), 'mapa', ['id'], unique=False)
        return

    columns = {column['name']: column for column in inspector.get_columns('mapa')}

    if 'tipo' not in columns:
        op.add_column('mapa', sa.Column('tipo', tipomapaenum, nullable=True))

    if 'area' not in columns:
        op.add_column('mapa', sa.Column('area', sa.String(), nullable=True))

    edicion_column = columns.get('edicion')
    if edicion_column is not None and not isinstance(edicion_column['type'], sa.Text):
        op.alter_column(
            'mapa',
            'edicion',
            existing_type=edicion_column['type'],
            type_=sa.Text(),
            existing_nullable=edicion_column['nullable'],
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if 'mapa' in inspector.get_table_names():
        columns = {column['name']: column for column in inspector.get_columns('mapa')}

        edicion_column = columns.get('edicion')
        if edicion_column is not None and isinstance(edicion_column['type'], sa.Text):
            op.alter_column(
                'mapa',
                'edicion',
                existing_type=sa.Text(),
                type_=sa.VARCHAR(),
                existing_nullable=edicion_column['nullable'],
            )

        if 'area' in columns:
            op.drop_column('mapa', 'area')

        if 'tipo' in columns:
            op.drop_column('mapa', 'tipo')

    tipomapaenum.drop(bind, checkfirst=True)
