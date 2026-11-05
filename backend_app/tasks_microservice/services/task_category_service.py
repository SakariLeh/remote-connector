from datetime import datetime, timezone

from backend_app.tasks_microservice.DTO import (
    TaskCategoryCreateDTO,
    TaskCategoryRequestDTO,
    TaskCategoryResponseDTO,
)
from backend_app.tasks_microservice.entities import TaskCategoryEntity
from backend_app.tasks_microservice.repositories import TaskCategoryRepository


class TaskCategoryService:
    def __init__(self, task_category_repository: TaskCategoryRepository):
        self.category_repo = task_category_repository

    async def create_category(self, dto: TaskCategoryCreateDTO) -> TaskCategoryResponseDTO:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        category = TaskCategoryEntity(
            name=dto.name,
            description=dto.description,
            created_at=now,
            updated_at=now,
        )
        return await self.category_repo.create_category(category)

    async def get_category_by_id(self, category_id: int) -> TaskCategoryResponseDTO | None:
        return await self.category_repo.get_category_by_id(category_id)

    async def get_all_categories(self) -> list[TaskCategoryResponseDTO]:
        return list(await self.category_repo.get_all_categories())

    async def update_category(self, dto: TaskCategoryRequestDTO) -> TaskCategoryResponseDTO:
        existing = await self.category_repo.get_category_entity_by_id(dto.id)
        if not existing:
            raise ValueError("Task category not found")

        if dto.name is not None:
            existing.name = dto.name
        if dto.description is not None:
            existing.description = dto.description

        existing.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        return await self.category_repo.update_category(existing)

    async def delete_category(self, category_id: int) -> bool:
        return await self.category_repo.delete_category(category_id)
