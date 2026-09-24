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
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('documentacion'):
        columns = {col['name']: col for col in inspector.get_columns('documentacion')}
        if 'descripcion' in columns and not columns['descripcion']['nullable']:
            op.alter_column(
                'documentacion',
                'descripcion',
                existing_type=sa.Text(),
                nullable=True,
            )

    with op.get_context().autocommit_block():
        # Validar la existencia del Enum directamente dentro del bloque autocommit
        enum_exists = bool(
            bind.execute(
                sa.text("SELECT 1 FROM pg_type WHERE typname = 'municipioenum'")
            ).scalar()
        )
        if enum_exists:
            for value in NEW_MUNICIPIO_VALUES:
                op.execute(
                    sa.text(
                        f"ALTER TYPE municipioenum ADD VALUE IF NOT EXISTS '{value}'"
                    )
                )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('documentacion'):
        columns = {col['name']: col for col in inspector.get_columns('documentacion')}
        if 'descripcion' in columns:
            op.alter_column(
                'documentacion',
                'descripcion',
                existing_type=sa.Text(),
                nullable=False,
            )