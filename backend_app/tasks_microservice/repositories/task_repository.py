from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.tasks_microservice.DTO import TaskResponseDTO
from backend_app.tasks_microservice.entities import TaskEntity


class TaskRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    async def get_task_by_id(self, task_id: int) -> TaskResponseDTO | None:
        result = await self.db.execute(select(TaskEntity).where(TaskEntity.id == task_id))
        task = result.scalar_one_or_none()
        return TaskResponseDTO.model_validate(task) if task else None

    async def get_task_entity_by_id(self, task_id: int) -> TaskEntity | None:
        result = await self.db.execute(select(TaskEntity).where(TaskEntity.id == task_id))
        return result.scalar_one_or_none()

    async def get_all_tasks(self) -> Sequence[TaskResponseDTO]:
        result = await self.db.execute(select(TaskEntity))
        return [TaskResponseDTO.model_validate(task) for task in result.scalars().all()]

    async def create_task(self, task: TaskEntity) -> TaskResponseDTO:
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return TaskResponseDTO.model_validate(task)

    async def update_task(self, task: TaskEntity) -> TaskResponseDTO | None:
        await self.db.commit()
        await self.db.refresh(task)
        return TaskResponseDTO.model_validate(task)

    async def delete_task(self, task_id: int) -> bool:
        task = await self.get_task_entity_by_id(task_id)
        if not task:
            return False
        await self.db.delete(task)
        await self.db.commit()
        return True
