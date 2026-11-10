from typing import Sequence

from sqlalchemy import Select, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.tasks_microservice.DTO import TaskResponseDTO
from backend_app.tasks_microservice.entities import TaskCategoryEntity, TaskEntity


def _to_response(task: TaskEntity, category_name: str) -> TaskResponseDTO:
    return TaskResponseDTO(
        id=task.id,
        publisher_id=task.publisher_id,
        actor_id=task.actor_id,
        task_category_id=task.category_id,
        task_category_name=category_name,
        title=task.title,
        description=task.description,
        status=task.status,
        price=task.price,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


def _with_category() -> Select[tuple[TaskEntity, str]]:
    return select(TaskEntity, TaskCategoryEntity.name).join(
        TaskCategoryEntity,
        TaskCategoryEntity.id == TaskEntity.category_id,
    )


class TaskRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    async def user_exists(self, user_id: int) -> bool:
        result = await self.db.execute(
            text("SELECT 1 FROM users WHERE id = :user_id LIMIT 1"),
            {"user_id": user_id},
        )
        return result.first() is not None

    async def get_task_by_id(self, task_id: int) -> TaskResponseDTO | None:
        return await self._one(_with_category().where(TaskEntity.id == task_id))

    async def get_task_entity_by_id(self, task_id: int) -> TaskEntity | None:
        result = await self.db.execute(select(TaskEntity).where(TaskEntity.id == task_id))
        return result.scalar_one_or_none()

    async def get_all_tasks(self) -> Sequence[TaskResponseDTO]:
        return await self._many(_with_category())

    async def get_unassigned_tasks(self) -> Sequence[TaskResponseDTO]:
        return await self._many(_with_category().where(TaskEntity.actor_id.is_(None)))

    async def get_tasks_by_publisher_id(self, publisher_id: int) -> Sequence[TaskResponseDTO]:
        return await self._many(_with_category().where(TaskEntity.publisher_id == publisher_id))

    async def create_task(self, task: TaskEntity) -> TaskResponseDTO:
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        created = await self.get_task_by_id(task.id)
        if created is None:
            raise ValueError("Created task could not be loaded")
        return created

    async def update_task(self, task: TaskEntity) -> TaskResponseDTO | None:
        await self.db.commit()
        await self.db.refresh(task)
        return await self.get_task_by_id(task.id)

    async def delete_task(self, task_id: int) -> bool:
        task = await self.get_task_entity_by_id(task_id)
        if not task:
            return False
        await self.db.delete(task)
        await self.db.commit()
        return True

    async def _one(self, stmt: Select[tuple[TaskEntity, str]]) -> TaskResponseDTO | None:
        result = await self.db.execute(stmt)
        row = result.one_or_none()
        if row is None:
            return None
        task, category_name = row
        return _to_response(task, category_name)

    async def _many(self, stmt: Select[tuple[TaskEntity, str]]) -> list[TaskResponseDTO]:
        result = await self.db.execute(stmt)
        return [_to_response(task, category_name) for task, category_name in result.all()]
