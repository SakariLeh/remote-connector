"""task_assignments table

Revision ID: 002_task_assignments
Revises: 001_initial
Create Date: 2026-09-18

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_task_assignments"
down_revision: Union[str, Sequence[str], None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = set(inspector.get_table_names())

    if "task_assignments" not in existing:
        op.create_table(
            "task_assignments",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("actor_id", sa.Integer(), nullable=False),
            sa.Column("task_id", sa.Integer(), nullable=False),
            sa.Column("actor_status", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["actor_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("actor_id", "task_id", name="uq_task_assignments_actor_task"),
        )
        with op.batch_alter_table("task_assignments", schema=None) as batch_op:
            batch_op.create_index(batch_op.f("ix_task_assignments_actor_id"), ["actor_id"], unique=False)
            batch_op.create_index(batch_op.f("ix_task_assignments_task_id"), ["task_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = set(inspector.get_table_names())

    if "task_assignments" in existing:
        with op.batch_alter_table("task_assignments", schema=None) as batch_op:
            batch_op.drop_index(batch_op.f("ix_task_assignments_task_id"))
            batch_op.drop_index(batch_op.f("ix_task_assignments_actor_id"))
        op.drop_table("task_assignments")
