from alembic import op

revision = "d7e8f9a0b1c2"
down_revision = "936e99a3acdf"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TYPE tipoenum ADD VALUE IF NOT EXISTS 'cartografia'"
    )


def downgrade() -> None:
    pass
