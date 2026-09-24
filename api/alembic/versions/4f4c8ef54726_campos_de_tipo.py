"""campos de tipo

Revision ID: 4f4c8ef54726
Revises: merge_zz_ffcbb
Create Date: 2026-06-17 21:36:53.495952

"""
import sqlalchemy as sa
from alembic import op

revision = '4f4c8ef54726'
down_revision = 'merge_zz_ffcbb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1. Procesar la tabla 'documentacion' solo si existe físicamente
    if inspector.has_table('documentacion'):
        documentacion_columns = {
            column['name'] for column in inspector.get_columns('documentacion')
        }

        if 'anyo' not in documentacion_columns:
            op.add_column('documentacion', sa.Column('anyo', sa.Integer(), nullable=True))
        if 'archivo' not in documentacion_columns:
            op.add_column('documentacion', sa.Column('archivo', sa.String(), nullable=True))

        # Creación segura de tipoenum sin delegar en SQLAlchemy Enum.create
        enum_exists = bool(
            bind.execute(
                sa.text("SELECT 1 FROM pg_type WHERE typname = 'tipoenum'")
            ).scalar()
        )
        if not enum_exists:
            op.execute("CREATE TYPE tipoenum AS ENUM ('metodologia', 'codigo', 'manual')")

        tipo_enum = sa.Enum('metodologia', 'codigo', 'manual', name='tipoenum')

        if 'tipo' not in documentacion_columns:
            op.add_column('documentacion', sa.Column('tipo', tipo_enum, nullable=True))
            if 'metodologia' in documentacion_columns:
                op.execute("UPDATE documentacion SET tipo = 'metodologia' WHERE metodologia IS NOT NULL AND metodologia <> ''")
            if 'codigo' in documentacion_columns:
                op.execute("UPDATE documentacion SET tipo = 'codigo' WHERE codigo IS NOT NULL AND codigo <> '' AND (tipo IS NULL OR tipo::text = '')")
            op.execute("UPDATE documentacion SET tipo = 'manual' WHERE tipo IS NULL OR tipo::text = ''")
            op.alter_column('documentacion', 'tipo', existing_type=tipo_enum, nullable=False)

        op.execute('ALTER TABLE documentacion DROP COLUMN IF EXISTS codigo')
        op.execute('ALTER TABLE documentacion DROP COLUMN IF EXISTS metodologia')

    # 2. Procesar la tabla 'flashes' solo si existe físicamente
    if inspector.has_table('flashes'):
        mes_enum_exists = bool(
            bind.execute(
                sa.text("SELECT 1 FROM pg_type WHERE typname = 'mesenum'")
            ).scalar()
        )
        if not mes_enum_exists:
            op.execute(
                "CREATE TYPE mesenum AS ENUM ("
                "'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', "
                "'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre')"
            )

        mes_enum = sa.Enum(
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
            name='mesenum'
        )

        flashes_columns = {
            column['name'] for column in inspector.get_columns('flashes')
        }
        if 'mes' not in flashes_columns:
            op.add_column('flashes', sa.Column('mes', mes_enum, nullable=True))
        if 'anyo' not in flashes_columns:
            op.add_column('flashes', sa.Column('anyo', sa.Integer(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table('flashes'):
        flashes_columns = {column['name'] for column in inspector.get_columns('flashes')}
        if 'anyo' in flashes_columns:
            op.drop_column('flashes', 'anyo')
        if 'mes' in flashes_columns:
            op.drop_column('flashes', 'mes')

    if inspector.has_table('documentacion'):
        doc_columns = {column['name'] for column in inspector.get_columns('documentacion')}
        if 'metodologia' not in doc_columns:
            op.add_column('documentacion', sa.Column('metodologia', sa.TEXT(), nullable=True))
        if 'codigo' not in doc_columns:
            op.add_column('documentacion', sa.Column('codigo', sa.VARCHAR(length=200), nullable=True))
        
        op.execute("""
        UPDATE documentacion SET metodologia = '' WHERE metodologia IS NULL;
        UPDATE documentacion SET codigo = '' WHERE codigo IS NULL;
        UPDATE documentacion SET metodologia = '' WHERE tipo = 'metodologia';
        UPDATE documentacion SET codigo = '' WHERE tipo = 'codigo';
        """)
        
        if 'tipo' in doc_columns:
            op.drop_column('documentacion', 'tipo')
        if 'archivo' in doc_columns:
            op.drop_column('documentacion', 'archivo')
        if 'anyo' in doc_columns:
            op.drop_column('documentacion', 'anyo')

    # Eliminar enums si existen
    for enum_name in ['mesenum', 'tipoenum']:
        try:
            op.execute(f"DROP TYPE IF EXISTS {enum_name}")
        except Exception:
            pass