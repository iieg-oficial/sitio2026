"""eliminacion peridicidad

Revision ID: 3a3bab96269b
Revises: 00f82b7c5def
Create Date: 2026-07-13 16:18:08.628459

"""
import sqlalchemy as sa
from alembic import op

revision = '3a3bab96269b'
down_revision = '00f82b7c5def'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # DROP TABLE IF EXISTS previene fallos si la tabla no existe previamente
    op.execute('DROP TABLE IF EXISTS documentacion_proyectos')
    op.execute('DROP INDEX IF EXISTS ix_proyectos_id')
    op.execute('DROP TABLE IF EXISTS proyectos')


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Recrear tabla 'proyectos' solo si no existe
    if not inspector.has_table('proyectos'):
        op.create_table(
            'proyectos',
            sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('proyectos_id_seq'::regclass)"), autoincrement=True, nullable=False),
            sa.Column('nombre', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
            sa.Column('descripcion', sa.VARCHAR(length=200), autoincrement=False, nullable=True),
            sa.Column('slug', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
            sa.PrimaryKeyConstraint('id', name='proyectos_pkey'),
            postgresql_ignore_search_path=False
        )
        op.create_index('ix_proyectos_id', 'proyectos', ['id'], unique=False)

    # Recrear tabla pivote solo si ambas tablas padre existen y la pivote no
    if (
        not inspector.has_table('documentacion_proyectos') 
        and inspector.has_table('documentacion') 
        and inspector.has_table('proyectos')
    ):
        op.create_table(
            'documentacion_proyectos',
            sa.Column('documentacion_id', sa.INTEGER(), autoincrement=False, nullable=False),
            sa.Column('proyecto_id', sa.INTEGER(), autoincrement=False, nullable=False),
            sa.ForeignKeyConstraint(['documentacion_id'], ['documentacion.id'], name='documentacion_proyectos_documentacion_id_fkey'),
            sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], name='documentacion_proyectos_proyecto_id_fkey'),
            sa.PrimaryKeyConstraint('documentacion_id', 'proyecto_id', name='documentacion_proyectos_pkey')
        )