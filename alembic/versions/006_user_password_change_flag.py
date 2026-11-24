"""Add requires_password_change to users

Revision ID: 006_password_change
Revises: 005_names_ratings
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006_password_change"
down_revision: Union[str, Sequence[str], None] = "005_names_ratings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if "users" not in sa.inspect(bind).get_table_names():
        return

    columns = {column["name"] for column in sa.inspect(bind).get_columns("users")}
    if "requires_password_change" not in columns:
        op.add_column(
            "users",
            sa.Column(
                "requires_password_change",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if "users" not in sa.inspect(bind).get_table_names():
        return

    columns = {column["name"] for column in sa.inspect(bind).get_columns("users")}
    if "requires_password_change" in columns:
        with op.batch_alter_table("users", schema=None) as batch_op:
            batch_op.drop_column("requires_password_change")
