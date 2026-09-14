"""make documentacion descripcion nullable

Revision ID: a8f9e0b1c2d3
Revises: 3c59a2cbf559
Create Date: 2026-08-20

"""
import sqlalchemy as sa

from alembic import op

revision = 'a8f9e0b1c2d3'
down_revision = '3c59a2cbf559'
branch_labels = None
depends_on = None


NEW_MUNICIPIO_VALUES = [
    # Values added to the original enum from the initial migration
    'atemajac_de_brizuela',
    'amacueca',
    'canadas_de_obregon',
    'cuquio',
    'etzatlan',
    'ixtlahuacan_de_los_membrillos',
    'ixtlahuacan_del_rio',
    'jalostotitlan',
    'jamay',
    'jesus_maria',
    'jilotlan_de_los_dolores',
    'jocotepec',
    'juanacatlan',
    'juchitlan',
    'san_ignacio_cerro_gordo',
    'san_pedro_tlaquepaque',
    'san_sebastian_del_oeste',
    'tlajomulco_de_zuniga',
    'tonala',
]


def upgrade() -> None:
    op.alter_column('documentacion', 'descripcion',
               existing_type=sa.Text(),
               nullable=True)
    # ALTER TYPE cannot run inside a transaction in PostgreSQL

    for value in NEW_MUNICIPIO_VALUES:
        op.execute(f"ALTER TYPE municipioenum ADD VALUE IF NOT EXISTS '{value}'")


def downgrade() -> None:
    op.alter_column('documentacion', 'descripcion',
               existing_type=sa.Text(),
               nullable=False)
