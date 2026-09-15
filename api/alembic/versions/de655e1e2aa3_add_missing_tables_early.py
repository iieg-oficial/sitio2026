"""add_missing_tables_early

Revision ID: de655e1e2aa3
Revises: 001
Create Date: 2026-09-15 20:45:31.872904

"""
from alembic import op
import sqlalchemy as sa

revision = 'de655e1e2aa3'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    if 'subject' not in existing_tables:
        op.create_table(
            'subject',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('titulo', sa.String(length=200), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.Column('parent_id', sa.Integer(), sa.ForeignKey('subject.id'), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=False),
        )

    if 'instituciones' not in existing_tables:
        op.create_table(
            'instituciones',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('nombre', sa.String(length=200), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.Column('logo', sa.String(length=200), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=False),
        )

    if 'modulos' not in existing_tables:
        op.create_table(
            'modulos',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('nombre', sa.String(length=200), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=False),
        )

    if 'perfiles' not in existing_tables:
        op.create_table(
            'perfiles',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('nombre', sa.String(length=200), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.Column(
                'area',
                sa.Enum(
                    'desarrollo',
                    'analisis',
                    'geoespacial',
                    'grafico',
                    'juridico',
                    'administracion',
                    'soporte',
                    name='areaenum',
                ),
                nullable=True,
            ),
            sa.Column('slug', sa.String(length=200), nullable=False),
        )

    if 'profesores' not in existing_tables:
        op.create_table(
            'profesores',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('nombre', sa.String(length=200), nullable=False),
            sa.Column('puesto', sa.String(length=200), nullable=False),
            sa.Column('descripcion', sa.String(length=200), nullable=True),
            sa.Column('foto', sa.String(length=200), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=False),
        )

    if 'snieg' not in existing_tables:
        op.create_table(
            'snieg',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('titulo', sa.String(length=255), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=False),
            sa.Column('imagen', sa.String(length=255), nullable=True),
            sa.Column('enlace', sa.String(length=255), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=False),
        )

    if 'cursos' not in existing_tables:
        op.create_table(
            'cursos',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('titulo', sa.String(length=200), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.Column('img_portada', sa.String(), nullable=True),
            sa.Column('inicio', sa.DateTime(), nullable=True),
            sa.Column('fin', sa.DateTime(), nullable=True),
            sa.Column('formato', sa.String(length=100), nullable=True),
            sa.Column('Horario', sa.String(length=100), nullable=True),
            sa.Column('Objetivo', sa.Text(), nullable=True),
            sa.Column('p_ingreso', sa.Text(), nullable=True),
            sa.Column('p_egreso', sa.Text(), nullable=True),
            sa.Column(
                'tipo_curso',
                sa.Enum('capacitacion', 'convocatoria', name='tipocurso'),
                nullable=False,
            ),
            sa.Column('destacado', sa.Boolean(), nullable=True),
            sa.Column('inscripcion', sa.Text(), nullable=True),
            sa.Column('acreditacion', sa.Text(), nullable=True),
            sa.Column('vigencia', sa.String(length=200), nullable=True),
            sa.Column('contacto', sa.String(length=200), nullable=True),
            sa.Column('clave', sa.String(length=200), nullable=True),
            sa.Column('archivo', sa.String(), nullable=True),
            sa.Column('formulario', sa.String(), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=False),
        )

    association_tables = {
        'curso_temas': (
            ('curso_id', 'cursos.id'),
            ('subject_id', 'subject.id'),
        ),
        'curso_modulos': (
            ('curso_id', 'cursos.id'),
            ('modulo_id', 'modulos.id'),
        ),
        'curso_instituciones': (
            ('curso_id', 'cursos.id'),
            ('institucion_id', 'instituciones.id'),
        ),
        'curso_perfiles': (
            ('curso_id', 'cursos.id'),
            ('perfil_id', 'perfiles.id'),
        ),
        'curso_profesores': (
            ('curso_id', 'cursos.id'),
            ('profesor_id', 'profesores.id'),
        ),
    }

    for table_name, columns in association_tables.items():
        if table_name not in existing_tables:
            op.create_table(
                table_name,
                *(
                    sa.Column(column_name, sa.Integer(), nullable=False)
                    for column_name, _ in columns
                ),
                *(
                    sa.ForeignKeyConstraint([column_name], [target])
                    for column_name, target in columns
                ),
                sa.PrimaryKeyConstraint(*(column_name for column_name, _ in columns)),
            )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    for table_name in (
        'curso_profesores',
        'curso_perfiles',
        'curso_instituciones',
        'curso_modulos',
        'curso_temas',
        'cursos',
        'snieg',
        'profesores',
        'perfiles',
        'modulos',
        'instituciones',
        'subject',
    ):
        if inspector.has_table(table_name):
            op.drop_table(table_name)

    if conn.dialect.name == 'postgresql':
        op.execute('DROP TYPE IF EXISTS tipocurso')
        op.execute('DROP TYPE IF EXISTS areaenum')
