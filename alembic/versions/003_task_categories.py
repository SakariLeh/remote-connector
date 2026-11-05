"""task_categories table

Revision ID: 003_task_categories
Revises: 002_task_assignments
Create Date: 2026-10-27

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_task_categories"
down_revision: Union[str, Sequence[str], None] = "002_task_assignments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = set(inspector.get_table_names())

    if "task_categories" not in existing:
        op.create_table(
            "task_categories",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("description", sa.String(length=255), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        with op.batch_alter_table("task_categories", schema=None) as batch_op:
            batch_op.create_index(batch_op.f("ix_task_categories_name"), ["name"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = set(inspector.get_table_names())

    if "task_categories" in existing:
        with op.batch_alter_table("task_categories", schema=None) as batch_op:
            batch_op.drop_index(batch_op.f("ix_task_categories_name"))
        op.drop_table("task_categories")
