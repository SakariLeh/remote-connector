"""tasks.category_id

Revision ID: 004_task_category_id
Revises: 003_task_categories
Create Date: 2026-10-29

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004_task_category_id"
down_revision: Union[str, Sequence[str], None] = "003_task_categories"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("tasks")}
    if "category_id" not in columns:
        with op.batch_alter_table("tasks", schema=None) as batch_op:
            batch_op.add_column(sa.Column("category_id", sa.Integer(), nullable=False))
            batch_op.create_foreign_key(
                "fk_tasks_category_id_task_categories",
                "task_categories",
                ["category_id"],
                ["id"],
            )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("tasks")}
    if "category_id" in columns:
        with op.batch_alter_table("tasks", schema=None) as batch_op:
            batch_op.drop_constraint("fk_tasks_category_id_task_categories", type_="foreignkey")
            batch_op.drop_column("category_id")
