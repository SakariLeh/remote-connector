from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.tasks_microservice.DTO import TaskCategoryResponseDTO
from backend_app.tasks_microservice.entities import TaskCategoryEntity


class TaskCategoryRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    async def get_category_by_id(self, category_id: int) -> TaskCategoryResponseDTO | None:
        category = await self.get_category_entity_by_id(category_id)
        return TaskCategoryResponseDTO.model_validate(category) if category else None

    async def get_category_entity_by_id(self, category_id: int) -> TaskCategoryEntity | None:
        result = await self.db.execute(
            select(TaskCategoryEntity).where(TaskCategoryEntity.id == category_id)
        )
        return result.scalar_one_or_none()

    async def get_all_categories(self) -> Sequence[TaskCategoryResponseDTO]:
        result = await self.db.execute(select(TaskCategoryEntity))
        return [
            TaskCategoryResponseDTO.model_validate(category)
            for category in result.scalars().all()
        ]

    async def create_category(self, category: TaskCategoryEntity) -> TaskCategoryResponseDTO:
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return TaskCategoryResponseDTO.model_validate(category)

    async def update_category(self, category: TaskCategoryEntity) -> TaskCategoryResponseDTO:
        await self.db.commit()
        await self.db.refresh(category)
        return TaskCategoryResponseDTO.model_validate(category)

    async def delete_category(self, category_id: int) -> bool:
        category = await self.get_category_entity_by_id(category_id)
        if not category:
            return False
        await self.db.delete(category)
        await self.db.commit()
        return True
