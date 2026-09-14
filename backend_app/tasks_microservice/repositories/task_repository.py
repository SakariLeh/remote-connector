from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.identity_microservice.DTO import UserResponseDTO
from backend_app.identity_microservice.entities import UserEntity
from backend_app.tasks_microservice.DTO.Response.task_response_dto import TaskResponseDTO
from backend_app.tasks_microservice.entities.task_entity import TaskEntity


# TODO: заменить на GenericRepository[TEntity, TResponseDTO]
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
