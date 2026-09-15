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


MESES = (
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
)

PERIOCIDADES = (
    'mensual', 'bimestral', 'trimestral', 'semestral', 'anual',
)

MUNICIPIOS = (
    'Acatic', 'Acatlán de Juárez', 'Ahualulco de Mercado', 'Amacueca',
    'Amatitán', 'Ameca', 'Arandas', 'Atemajac de Brizuela', 'Atengo',
    'Atenguillo', 'Atotonilco el Alto', 'Atoyac', 'Autlán de Navarro',
    'Ayotlán', 'Ayutla', 'Bolaños', 'Cabo Corrientes', 'Cañadas de Obregón',
    'Casimiro Castillo', 'Chapala', 'Chimaltitán', 'Chiquilistlán',
    'Cihuatlán', 'Cocula', 'Colotlán', 'Concepción de Buenos Aires',
    'Cuautitlán de García Barragán', 'Cuautla', 'Cuquío', 'Degollado',
    'Ejutla', 'El Arenal', 'El Grullo', 'El Limón', 'El Salto',
    'Encarnación de Díaz', 'Etzatlán', 'Gómez Farías', 'Guachinango',
    'Guadalajara', 'Hostotipaquillo', 'Huejúcar', 'Huejuquilla el Alto',
    'Ixtlahuacán de los Membrillos', 'Ixtlahuacán del Río', 'Jalostotitlán',
    'Jamay', 'Jesús María', 'Jilotlán de los Dolores', 'Jocotepec',
    'Juanacatlán', 'Juchitlán', 'La Barca', 'La Huerta',
    'La Manzanilla de la Paz', 'Lagos de Moreno', 'Magdalena', 'Mascota',
    'Mazamitla', 'Mexticacán', 'Mezquitic', 'Mixtlán', 'Ocotlán',
    'Ojuelos de Jalisco', 'Pihuamo', 'Poncitlán', 'Puerto Vallarta',
    'Quitupan', 'San Cristóbal de la Barranca', 'San Diego de Alejandría',
    'San Gabriel', 'San Ignacio Cerro Gordo', 'San Juan de los Lagos',
    'San Juanito de Escobedo', 'San Julián', 'San Marcos',
    'San Martín de Bolaños', 'San Martín Hidalgo', 'San Miguel el Alto',
    'San Pedro Tlaquepaque', 'San Sebastián del Oeste',
    'Santa María de los Ángeles', 'Santa María del Oro', 'Sayula', 'Tala',
    'Talpa de Allende', 'Tamazula de Gordiano', 'Tapalpa', 'Tecalitlán',
    'Techaluta de Montenegro', 'Tecolotlán', 'Tenamaxtlán', 'Teocaltiche',
    'Teocuitatlán de Corona', 'Tepatitlán de Morelos', 'Tequila',
    'Teuchitlán', 'Tizapán el Alto', 'Tlajomulco de Zúñiga', 'Tolimán',
    'Tomatlán', 'Tonalá', 'Tonaya', 'Tonila', 'Totatiche', 'Tototlán',
    'Tuxcacuesco', 'Tuxcueca', 'Tuxpan', 'Unión de San Antonio',
    'Unión de Tula', 'Valle de Guadalupe', 'Valle de Juárez',
    'Villa Corona', 'Villa Guerrero', 'Villa Hidalgo', 'Villa Purificación',
    'Yahualica de González Gallo', 'Zacoalco de Torres', 'Zapotiltic',
    'Zapotitlán de Vadillo', 'Zapotlán del Rey', 'Zapotlán el Grande',
    'Zapotlanejo', 'Zapopan',
)


def _enum_type(conn, name, values):
    if conn.dialect.name != 'postgresql':
        return sa.Enum(*values, name=name, create_type=False)

    quoted_values = ', '.join("'%s'" % value.replace("'", "''") for value in values)
    try:
        with conn.begin_nested():
            conn.execute(sa.text(f'CREATE TYPE {name} AS ENUM ({quoted_values})'))
    except Exception:
        # El tipo ya existe o fue creado concurrentemente; se ignora con seguridad
        pass
    return sa.Enum(*values, name=name, create_type=False)


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

    if 'banner' not in existing_tables:
        op.create_table(
            'banner',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('titulo', sa.String(length=200), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.Column('imagen_desktop', sa.String(length=200), nullable=True),
            sa.Column('imagen_mobile', sa.String(length=200), nullable=True),
            sa.Column('imagen', sa.String(length=200), nullable=True),
            sa.Column('link', sa.String(length=200), nullable=True),
            sa.Column('boton', sa.String(length=200), nullable=True),
            sa.Column('color_fondo', sa.String(length=200), nullable=True),
            sa.Column('full_screen', sa.Boolean(), nullable=True),
            sa.Column('slug', sa.String(length=200), nullable=True),
        )

    if 'pages' not in existing_tables:
        op.create_table(
            'pages',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('link_interno', sa.Boolean(), nullable=True),
            sa.Column('activar', sa.Boolean(), nullable=True),
            sa.Column('slug_custom', sa.String(), nullable=False),
            sa.Column('description_meta', sa.Text(), nullable=True),
            sa.Column('keywords_meta', sa.String(), nullable=True),
            sa.Column('order', sa.Integer(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('slug', sa.String(length=200), nullable=False),
            sa.Column('parent_id', sa.Integer(), sa.ForeignKey('pages.id'), nullable=True),
        )
    else:
        page_columns = {column['name'] for column in inspector.get_columns('pages')}
        page_columns_to_add = {
            'description': sa.Column('description', sa.Text(), nullable=True),
            'link_interno': sa.Column('link_interno', sa.Boolean(), nullable=True),
            'activar': sa.Column('activar', sa.Boolean(), nullable=True),
            'slug_custom': sa.Column('slug_custom', sa.String(), nullable=True),
            'description_meta': sa.Column('description_meta', sa.Text(), nullable=True),
            'keywords_meta': sa.Column('keywords_meta', sa.String(), nullable=True),
            'order': sa.Column('order', sa.Integer(), nullable=True),
            'parent_id': sa.Column('parent_id', sa.Integer(), sa.ForeignKey('pages.id'), nullable=True),
        }
        for column_name, column in page_columns_to_add.items():
            if column_name not in page_columns:
                op.add_column('pages', column)

        if 'updated_at' not in page_columns:
            op.add_column('pages', sa.Column('updated_at', sa.DateTime(), nullable=True))

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
        try:
            with conn.begin_nested():
                op.create_table(
                    'perfiles',
                    sa.Column('id', sa.Integer(), primary_key=True, index=True),
                    sa.Column('nombre', sa.String(length=200), nullable=False),
                    sa.Column('descripcion', sa.Text(), nullable=True),
                    sa.Column(
                        'area',
                        _enum_type(
                            conn,
                            'areaenum',
                            ('desarrollo', 'analisis', 'geoespacial', 'grafico',
                             'juridico', 'administracion', 'soporte'),
                        ),
                        nullable=True,
                    ),
                    sa.Column('slug', sa.String(length=200), nullable=False),
                )
        except Exception as e:
            if "already exists" not in str(e):
                raise

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
        try:
            with conn.begin_nested():
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
                        _enum_type(conn, 'tipocurso', ('capacitacion', 'convocatoria')),
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
        except Exception as e:
            if "already exists" not in str(e):
                raise

    if 'cuadernillos' not in existing_tables:
        try:
            with conn.begin_nested():
                op.create_table(
                    'cuadernillos',
                    sa.Column('id', sa.Integer(), primary_key=True, index=True),
                    sa.Column('titulo', sa.String(length=200), nullable=False),
                    sa.Column('archivo', sa.String(length=200), nullable=True),
                    sa.Column('municipio', _enum_type(conn, 'municipioenum', MUNICIPIOS), nullable=True),
                    sa.Column('anyo', sa.Integer(), nullable=True),
                    sa.Column('slug', sa.String(length=200), nullable=True),
                )
        except Exception as e:
            if "already exists" not in str(e):
                raise

    if 'reportes' not in existing_tables:
        try:
            with conn.begin_nested():
                op.create_table(
                    'reportes',
                    sa.Column('id', sa.Integer(), primary_key=True, index=True),
                    sa.Column('titulo', sa.Text(), nullable=False),
                    sa.Column('fecha', sa.DateTime(), nullable=True),
                    sa.Column(
                        'periocidad',
                        _enum_type(conn, 'periocidadenum', PERIOCIDADES),
                        nullable=True,
                    ),
                    sa.Column('mes', _enum_type(conn, 'mesenum', MESES), nullable=True),
                    sa.Column('anyo', sa.Integer(), nullable=True),
                    sa.Column('archivo', sa.String(length=200), nullable=True),
                    sa.Column('claves', sa.String(length=200), nullable=True),
                    sa.Column('slug', sa.String(length=200), nullable=False),
                )
        except Exception as e:
            if "already exists" not in str(e):
                raise

    if 'reporte_temas' not in existing_tables:
        op.create_table(
            'reporte_temas',
            sa.Column('reporte_id', sa.Integer(), nullable=False),
            sa.Column('subject_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['reporte_id'], ['reportes.id']),
            sa.ForeignKeyConstraint(['subject_id'], ['subject.id']),
            sa.PrimaryKeyConstraint('reporte_id', 'subject_id'),
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
        'reporte_temas',
        'reportes',
        'cuadernillos',
        'cursos',
        'snieg',
        'profesores',
        'perfiles',
        'modulos',
        'instituciones',
        'banner',
        'subject',
    ):
        if inspector.has_table(table_name):
            op.drop_table(table_name)

    if conn.dialect.name == 'postgresql':
        op.execute('DROP TYPE IF EXISTS tipocurso')
        op.execute('DROP TYPE IF EXISTS areaenum')
        op.execute('DROP TYPE IF EXISTS municipioenum')
        op.execute('DROP TYPE IF EXISTS periocidadenum')
        op.execute('DROP TYPE IF EXISTS mesenum')