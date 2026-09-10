"""sync all municipio enum values

Revision ID: b2c3d4e5f6a7
Revises: a8f9e0b1c2d3
Create Date: 2026-08-20

Adds every MunicipioEnum member name to the Postgres municipioenum type.
Previous migrations added values via a hand-maintained list that drifted
out of sync with app/models/cuadernillos.py (e.g. guadalajara, zapopan
were defined in the model but never added to the DB enum). This
migration imports the model directly so it can never miss a value again.
"""
from alembic import op
from app.models.cuadernillos import MunicipioEnum

revision = 'b2c3d4e5f6a7'
down_revision = 'a8f9e0b1c2d3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ALTER TYPE cannot run inside a transaction in PostgreSQL
    op.execute("COMMIT")
    for member in MunicipioEnum:
        op.execute(f"ALTER TYPE municipioenum ADD VALUE IF NOT EXISTS '{member.name}'")


def downgrade() -> None:
    # Postgres does not support removing enum values; no-op.
    pass
