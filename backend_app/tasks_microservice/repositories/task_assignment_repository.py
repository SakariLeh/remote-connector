from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.tasks_microservice.DTO import (
    TaskAssignmentRequestDTO,
    TaskAssignmentResponseDTO,
)
from backend_app.tasks_microservice.entities import TaskAssignmentEntity, TaskEntity
from backend_app.identity_microservice.entities import UserEntity


class TaskAssignmentRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    @staticmethod
    def _to_response(assignment: TaskAssignmentEntity, actor_name: str) -> TaskAssignmentResponseDTO:
        return TaskAssignmentResponseDTO(
            id=assignment.id,
            actor_id=assignment.actor_id,
            actor_name=actor_name or "",
            task_id=assignment.task_id,
            actor_status=assignment.actor_status,
            rating=assignment.rating,
        )

    async def get_task_assignment_filtered(
        self, request_dto: TaskAssignmentRequestDTO
    ) -> list[TaskAssignmentResponseDTO]:
        query = (
            select(TaskAssignmentEntity, UserEntity.name)
            .join(UserEntity, UserEntity.id == TaskAssignmentEntity.actor_id)
        )
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
            self._to_response(row[0], row[1])
            for row in result.all()
        ]

    async def get_task_assignments_by_publisher(
        self,
        publisher_id: int,
        request_dto: TaskAssignmentRequestDTO | None = None,
    ) -> list[TaskAssignmentResponseDTO]:
        query = (
            select(TaskAssignmentEntity, UserEntity.name)
            .join(TaskEntity, TaskAssignmentEntity.task_id == TaskEntity.id)
            .join(UserEntity, UserEntity.id == TaskAssignmentEntity.actor_id)
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
            self._to_response(row[0], row[1])
            for row in result.all()
        ]

    async def get_task_assignment_by_id(
        self, task_assignment_id: int
    ) -> TaskAssignmentResponseDTO | None:
        result = await self.db.execute(
            select(TaskAssignmentEntity, UserEntity.name)
            .join(UserEntity, UserEntity.id == TaskAssignmentEntity.actor_id)
            .where(TaskAssignmentEntity.id == task_assignment_id)
        )
        row = result.one_or_none()
        return self._to_response(row[0], row[1]) if row else None

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
        response = await self.get_task_assignment_by_id(task_assignment.id)
        if response is None:
            raise ValueError("Created task assignment could not be loaded")
        return response

    async def update_task_assignment(
        self, task_assignment: TaskAssignmentEntity
    ) -> TaskAssignmentResponseDTO:
        await self.db.commit()
        await self.db.refresh(task_assignment)
        response = await self.get_task_assignment_by_id(task_assignment.id)
        if response is None:
            raise ValueError("Updated task assignment could not be loaded")
        return response

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
