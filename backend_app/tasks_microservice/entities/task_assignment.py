from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from backend_app.shared.db_context import Base


class TaskAssignmentEntity(Base):
    __tablename__ = "task_assignments"
    __table_args__ = (UniqueConstraint("actor_id", "task_id", name="uq_task_assignments_actor_task"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), nullable=False, index=True)
    # 1 - согласился выполнить, 2 - отказался после согласия, 3(необязательно) - выполнил задачу
    actor_status: Mapped[int] = mapped_column(Integer, nullable=False)
