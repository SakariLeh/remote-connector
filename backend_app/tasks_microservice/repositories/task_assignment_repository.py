from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.tasks_microservice.DTO import (
    TaskAssignmentRequestDTO,
    TaskAssignmentResponseDTO,
)
from backend_app.tasks_microservice.entities import TaskAssignmentEntity, TaskEntity


class TaskAssignmentRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    async def get_task_assignment_filtered(
        self, request_dto: TaskAssignmentRequestDTO
    ) -> list[TaskAssignmentResponseDTO]:
        query = select(TaskAssignmentEntity)
        if request_dto.id is not None:
            query = query.where(TaskAssignmentEntity.id == request_dto.id)
        if request_dto.actor_id is not None:
            query = query.where(TaskAssignmentEntity.actor_id == request_dto.actor_id)
        if request_dto.task_id is not None:
            query = query.where(TaskAssignmentEntity.task_id == request_dto.task_id)
        if request_dto.actor_status is not None:
            query = query.where(TaskAssignmentEntity.actor_status == request_dto.actor_status)

        result = await self.db.execute(query)
        return [
            TaskAssignmentResponseDTO.model_validate(row)
            for row in result.scalars().all()
        ]

    async def get_task_assignments_by_publisher(
        self,
        publisher_id: int,
        request_dto: TaskAssignmentRequestDTO | None = None,
    ) -> list[TaskAssignmentResponseDTO]:
        query = (
            select(TaskAssignmentEntity)
            .join(TaskEntity, TaskAssignmentEntity.task_id == TaskEntity.id)
            .where(TaskEntity.publisher_id == publisher_id)
        )
        if request_dto is not None:
            if request_dto.id is not None:
                query = query.where(TaskAssignmentEntity.id == request_dto.id)
            if request_dto.actor_id is not None:
                query = query.where(TaskAssignmentEntity.actor_id == request_dto.actor_id)
            if request_dto.task_id is not None:
                query = query.where(TaskAssignmentEntity.task_id == request_dto.task_id)
            if request_dto.actor_status is not None:
                query = query.where(
                    TaskAssignmentEntity.actor_status == request_dto.actor_status
                )

        result = await self.db.execute(query)
        return [
            TaskAssignmentResponseDTO.model_validate(row)
            for row in result.scalars().all()
        ]

    async def get_task_assignment_by_id(
        self, task_assignment_id: int
    ) -> TaskAssignmentResponseDTO | None:
        entity = await self._get_entity_by_id(task_assignment_id)
        return TaskAssignmentResponseDTO.model_validate(entity) if entity else None

    async def get_task_assignment_entity(
        self, actor_id: int, task_id: int
    ) -> TaskAssignmentEntity | None:
        result = await self.db.execute(
            select(TaskAssignmentEntity).where(
                TaskAssignmentEntity.actor_id == actor_id,
                TaskAssignmentEntity.task_id == task_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_task_assignment(
        self, task_assignment: TaskAssignmentEntity
    ) -> TaskAssignmentResponseDTO:
        self.db.add(task_assignment)
        await self.db.commit()
        await self.db.refresh(task_assignment)
        return TaskAssignmentResponseDTO.model_validate(task_assignment)

    async def update_task_assignment(
        self, task_assignment: TaskAssignmentEntity
    ) -> TaskAssignmentResponseDTO:
        await self.db.commit()
        await self.db.refresh(task_assignment)
        return TaskAssignmentResponseDTO.model_validate(task_assignment)

    async def delete_task_assignment(self, task_assignment_id: int) -> bool:
        entity = await self._get_entity_by_id(task_assignment_id)
        if not entity:
            return False
        await self.db.delete(entity)
        await self.db.commit()
        return True

    async def _get_entity_by_id(
        self, task_assignment_id: int
    ) -> TaskAssignmentEntity | None:
        result = await self.db.execute(
            select(TaskAssignmentEntity).where(
                TaskAssignmentEntity.id == task_assignment_id
            )
        )
        return result.scalar_one_or_none()
