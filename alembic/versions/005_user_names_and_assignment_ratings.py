"""Add user names and task assignment ratings

Revision ID: 005_names_ratings
Revises: 004_task_category_id
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005_names_ratings"
down_revision: Union[str, Sequence[str], None] = "004_task_category_id"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "users" in inspector.get_table_names():
        user_columns = {column["name"] for column in sa.inspect(bind).get_columns("users")}
        if "name" not in user_columns:
            op.add_column("users", sa.Column("name", sa.String(length=255), nullable=False, server_default=""))

    if "task_assignments" in inspector.get_table_names():
        assignment_columns = {
            column["name"]
            for column in sa.inspect(bind).get_columns("task_assignments")
        }
        if "rating" not in assignment_columns:
            op.add_column("task_assignments", sa.Column("rating", sa.Integer(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("task_assignments", schema=None) as batch_op:
        batch_op.drop_column("rating")
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("name")
