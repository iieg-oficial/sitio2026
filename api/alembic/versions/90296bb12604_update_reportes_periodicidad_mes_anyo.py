"""update reportes periodicidad mes anyo

Revision ID: 90296bb12604
Revises: c9f1a2b3d4e5
Create Date: 2026-06-05 16:58:59.443305

"""
import sqlalchemy as sa

from alembic import op

revision = '90296bb12604'
down_revision = 'c9f1a2b3d4e5'
branch_labels = None
depends_on = None


MESES = (
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
)

NUEVAS_PERIOCIDADES = (
    "bimestral",
    "trimestral",
    "semestral",
)


def _enum_exists(conn: sa.engine.Connection, enum_name: str) -> bool:
    return bool(
        conn.execute(
            sa.text("SELECT 1 FROM pg_type WHERE typname = :enum_name"),
            {"enum_name": enum_name},
        ).scalar()
    )


def _enum_value_exists(conn: sa.engine.Connection, enum_name: str, enum_value: str) -> bool:
    return bool(
        conn.execute(
            sa.text(
                """
                SELECT 1
                FROM pg_type t
                JOIN pg_enum e ON e.enumtypid = t.oid
                WHERE t.typname = :enum_name AND e.enumlabel = :enum_value
                """
            ),
            {"enum_name": enum_name, "enum_value": enum_value},
        ).scalar()
    )


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if _enum_exists(conn, "periocidadenum"):
        for periodicidad in NUEVAS_PERIOCIDADES:
            if not _enum_value_exists(conn, "periocidadenum", periodicidad):
                op.execute(sa.text(f"ALTER TYPE periocidadenum ADD VALUE '{periodicidad}'"))

    if not _enum_exists(conn, "mesenum"):
        quoted_values = ", ".join(f"'{mes}'" for mes in MESES)
        op.execute(sa.text(f"CREATE TYPE mesenum AS ENUM ({quoted_values})"))

    if "reportes" not in inspector.get_table_names():
        return

    columnas = {col["name"] for col in inspector.get_columns("reportes")}

    if "mes" not in columnas:
        op.add_column(
            "reportes",
            sa.Column("mes", sa.Enum(*MESES, name="mesenum", create_type=False), nullable=True),
        )

    if "anyo" not in columnas:
        op.add_column("reportes", sa.Column("anyo", sa.Integer(), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if "reportes" in inspector.get_table_names():
        columnas = {col["name"] for col in inspector.get_columns("reportes")}
        if "anyo" in columnas:
            op.drop_column("reportes", "anyo")
        if "mes" in columnas:
            op.drop_column("reportes", "mes")

    # PostgreSQL no permite remover valores de ENUM de forma directa sin recrear el tipo.
    # Conservamos los valores agregados para evitar migraciones destructivas.
