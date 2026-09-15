"""add_telefono_directorio_add_cuadernillos

Revision ID: a1b2c3d4e5f6
Revises: 62523bba38ac, b5c6d7e8f9a0
Create Date: 2026-05-22

"""
import sqlalchemy as sa
from alembic import op

revision = 'a1b2c3d4e5f6'
down_revision = ('62523bba38ac', 'b5c6d7e8f9a0')
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1. Crear tipo ENUM de forma defensiva e independiente
    with op.get_context().autocommit_block():
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'municipioenum') THEN
                    CREATE TYPE municipioenum AS ENUM (
                        'acatic', 'acatlan_de_juarez', 'ahualulco_de_mercado', 'amacoeca', 'amatitan',
                        'ameca', 'arandas', 'atengo', 'atenguillo', 'atotonilco_el_alto', 'atoyac',
                        'autlan_de_navarro', 'ayotlan', 'ayutla', 'bolanos', 'cabo_corrientes',
                        'casimiro_castillo', 'chapala', 'chimaltitan', 'chiquilistlan', 'cihuatlan',
                        'cocula', 'colotlan', 'concepcion_de_buenos_aires', 'cuautitlan_de_garcia_barragan',
                        'cuautla', 'quiquio', 'degollado', 'ejutla', 'el_arenal', 'el_grullo', 'el_limon',
                        'el_salto', 'encarnacion_de_diaz', 'gomez_farias', 'guachinango', 'hostotipaquillo',
                        'huejucar', 'huejuquilla_el_alto', 'la_barca', 'la_manzanilla_de_la_paz', 'la_huerta',
                        'lagos_de_moreno', 'magdalena', 'mascota', 'mazamitla', 'mexticacan', 'mezquitic',
                        'mixtlan', 'ocotlan', 'ojuelos_de_jalisco', 'pihuamo', 'poncitlan', 'puerto_vallarta',
                        'villa_purificacion', 'quitupan', 'san_cristobal_de_la_barranca', 'san_diego_de_alejandria',
                        'san_juan_de_los_lagos', 'san_juanito_de_escobedo', 'san_julian', 'san_marcos',
                        'san_martin_de_bolanos', 'san_martin_hidalgo', 'san_miguel_el_alto', 'san_patricio_melaque',
                        'san_sebastian_el_oeste', 'santa_maria_de_los_angeles', 'santa_maria_del_oro', 'sayula',
                        'tala', 'talpa_de_allende', 'tamazula_de_gordiano', 'tapalpa', 'tecalitlan',
                        'techaluta_de_montenegro', 'tecolotlan', 'tenamaxtlan', 'teocaltiche',
                        'teocuitatlan_de_corona', 'tepatitlan_de_morelos', 'tequila', 'teuchitlan',
                        'tizapan_el_alto', 'toliman', 'tomatlan', 'tonaya', 'tonila', 'totatiche', 'tototlan',
                        'tuxcacuesco', 'tuxcueca', 'tuxpan', 'union_de_san_antonio', 'union_de_tula',
                        'valle_de_guadalupe', 'valle_de_juarez', 'villa_corona', 'villa_guerrero', 'villa_hidalgo',
                        'cañadas_de_obregon', 'yahualica_de_gonzalez_gallo', 'zacoalco_de_torres', 'zafiro',
                        'zapotiltic', 'zapotitlan_de_vadillo', 'zapotlan_del_rey', 'zapotlanejo', 'san_gabriel',
                        'zapotlan_el_grande'
                    );
                END IF;
            END$$;
            """
        )

    # 2. Crear tabla 'directorio'
    if not inspector.has_table('directorio'):
        op.create_table(
            'directorio',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('nombre', sa.String(255), nullable=False),
            sa.Column('cargo', sa.String(255), nullable=False),
            sa.Column('director', sa.Boolean(), nullable=True),
            sa.Column('slug', sa.String(200), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )
    op.execute('CREATE INDEX IF NOT EXISTS ix_directorio_id ON directorio (id)')

    # 3. Crear tabla 'cuadernillos' referenciando el ENUM existente mediante Postgres postgresql.ENUM
    if not inspector.has_table('cuadernillos'):
        op.create_table(
            'cuadernillos',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('titulo', sa.String(200), nullable=False),
            sa.Column('archivo', sa.String(200), nullable=True),
            sa.Column(
                'municipio',
                sa.postgresql.ENUM(name='municipioenum', create_type=False),
                nullable=True,
            ),
            sa.Column('anyo', sa.Integer(), nullable=True),
            sa.Column('slug', sa.String(200), nullable=True),
            sa.PrimaryKeyConstraint('id'),
        )
    op.execute('CREATE INDEX IF NOT EXISTS ix_cuadernillos_id ON cuadernillos (id)')

    # 4. Columnas adicionales en 'directorio'
    inspector = sa.inspect(bind)
    if inspector.has_table('directorio'):
        directorio_columns = {column['name'] for column in inspector.get_columns('directorio')}
        if 'telefono' not in directorio_columns:
            op.add_column('directorio', sa.Column('telefono', sa.String(50), nullable=True))
        if 'email' not in directorio_columns:
            op.add_column('directorio', sa.Column('email', sa.String(255), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('directorio'):
        directorio_columns = {column['name'] for column in inspector.get_columns('directorio')}
        if 'email' in directorio_columns:
            op.drop_column('directorio', 'email')
        if 'telefono' in directorio_columns:
            op.drop_column('directorio', 'telefono')

    if inspector.has_table('cuadernillos'):
        op.execute('DROP INDEX IF EXISTS ix_cuadernillos_id')
        op.drop_table('cuadernillos')

    if inspector.has_table('directorio'):
        op.execute('DROP INDEX IF EXISTS ix_directorio_id')
        op.drop_table('directorio')

    with op.get_context().autocommit_block():
        op.execute('DROP TYPE IF EXISTS municipioenum')