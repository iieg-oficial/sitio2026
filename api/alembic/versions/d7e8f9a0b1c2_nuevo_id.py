import sqlalchemy as sa
from alembic import op

revision = "d7e8f9a0b1c2"
down_revision = "936e99a3acdf"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    with op.get_context().autocommit_block():
        # Verificar si el tipo 'tipoenum' existe en PostgreSQL
        enum_exists = bool(
            bind.execute(
                sa.text("SELECT 1 FROM pg_type WHERE typname = 'tipoenum'")
            ).scalar()
        )

        if enum_exists:
            op.execute("ALTER TYPE tipoenum ADD VALUE IF NOT EXISTS 'cartografia'")
        else:
            op.execute("CREATE TYPE tipoenum AS ENUM ('cartografia')")


def downgrade() -> None:
    pass