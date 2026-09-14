from datetime import datetime, timezone

from backend_app.tasks_microservice.DTO import TaskCreateDTO, TaskRequestDTO, TaskResponseDTO
from backend_app.tasks_microservice.entities import TaskEntity
from backend_app.tasks_microservice.repositories import TaskRepository
from backend_app.tasks_microservice.types import TaskStatusTypes


class TaskService:
    def __init__(self, task_repository: TaskRepository):
        self.task_repo = task_repository

    async def create_task(self, dto: TaskCreateDTO, publisher_id: int) -> TaskResponseDTO:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        task = TaskEntity(
            publisher_id=publisher_id,
            actor_id=None,
            title=dto.title,
            description=dto.description,
            status=TaskStatusTypes.NEW,
            price=dto.price,
            created_at=now,
            updated_at=now,
        )
        return await self.task_repo.create_task(task)

    async def get_task_by_id(self, task_id: int) -> TaskResponseDTO | None:
        return await self.task_repo.get_task_by_id(task_id)

    async def get_all_tasks(self) -> list[TaskResponseDTO]:
        return list(await self.task_repo.get_all_tasks())

    async def get_unassigned_tasks(self) -> list[TaskResponseDTO]:
        return list(await self.task_repo.get_unassigned_tasks())

    async def update_task(self, dto: TaskRequestDTO) -> TaskResponseDTO:
        existing = await self.task_repo.get_task_entity_by_id(dto.id)
        if not existing:
            raise ValueError("Task not found")

        if dto.title is not None:
            existing.title = dto.title
        if dto.description is not None:
            existing.description = dto.description
        if dto.price is not None:
            existing.price = dto.price
        if dto.status is not None:
            existing.status = dto.status
        if dto.actor_id is not None:
            existing.actor_id = dto.actor_id

        existing.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

        updated = await self.task_repo.update_task(existing)
        if not updated:
            raise ValueError("Task not found")
        return updated

    async def delete_task(self, task_id: int) -> bool:
        return await self.task_repo.delete_task(task_id)
