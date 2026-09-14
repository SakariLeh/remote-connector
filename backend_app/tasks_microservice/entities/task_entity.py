import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, foreign, mapped_column

from backend_app.identity_microservice.entities import UserEntity
from backend_app.tasks_microservice.types.task_status_types import TaskStatusTypes


# TODO: вынести Base в generic db_context (общий DeclarativeBase для всех entity)
class Base(DeclarativeBase):
    pass


class TaskEntity(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    publisherId: Mapped[int] = mapped_column(ForeignKey(UserEntity.id), nullable=False)
    actorId: Mapped[int | None] = mapped_column(ForeignKey(UserEntity.id), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[TaskStatusTypes] = mapped_column(String(50), nullable=False, default=TaskStatusTypes.NEW)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    createdAt: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    updatedAt: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)


