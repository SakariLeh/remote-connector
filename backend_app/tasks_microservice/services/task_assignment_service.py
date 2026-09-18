from datetime import datetime, timezone

from backend_app.tasks_microservice.DTO import (
    TaskAssignmentRequestDTO,
    TaskAssignmentResponseDTO,
    TaskPublisherViewDTO,
)
from backend_app.tasks_microservice.entities import TaskAssignmentEntity
from backend_app.tasks_microservice.repositories import (
    TaskAssignmentRepository,
    TaskRepository,
)
from backend_app.tasks_microservice.types import TaskActorStatusTypes, TaskStatusTypes


class TaskAssignmentService:
    def __init__(
        self,
        task_assignment_repository: TaskAssignmentRepository,
        task_repository: TaskRepository,
    ):
        self.task_assignment_repo = task_assignment_repository
        self.task_repo = task_repository

    async def subscribe(self, task_id: int, actor_id: int) -> TaskAssignmentResponseDTO:
        task = await self.task_repo.get_task_by_id(task_id)
        if not task:
            raise ValueError("Task not found")
        if task.publisher_id == actor_id:
            raise ValueError("Publisher cannot subscribe to own task")

        existing = await self.task_assignment_repo.get_task_assignment_entity(
            actor_id, task_id
        )
        if existing:
            raise ValueError("Already subscribed to this task")

        if not await self.task_repo.user_exists(actor_id):
            raise ValueError("Actor user not found")

        assignment = TaskAssignmentEntity(
            actor_id=actor_id,
            task_id=task_id,
            actor_status=int(TaskActorStatusTypes.ACCEPTED),
        )
        return await self.task_assignment_repo.create_task_assignment(assignment)

    async def decline(self, task_id: int, actor_id: int) -> TaskAssignmentResponseDTO:
        assignment = await self.task_assignment_repo.get_task_assignment_entity(
            actor_id, task_id
        )
        if not assignment:
            raise ValueError("Assignment not found")

        assignment.actor_status = int(TaskActorStatusTypes.DECLINED)
        result = await self.task_assignment_repo.update_task_assignment(assignment)

        task = await self.task_repo.get_task_entity_by_id(task_id)
        if task and task.actor_id == actor_id:
            task.actor_id = None
            task.status = TaskStatusTypes.NEW
            task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            await self.task_repo.update_task(task)

        return result

    async def select_actor(self, task_id: int, publisher_id: int, actor_id: int) -> TaskAssignmentResponseDTO:
        task = await self.task_repo.get_task_entity_by_id(task_id)
        if not task:
            raise ValueError("Task not found")
        if task.publisher_id != publisher_id:
            raise ValueError("Only publisher can select actor")

        assignment = await self.task_assignment_repo.get_task_assignment_entity(
            actor_id, task_id
        )
        if not assignment:
            raise ValueError("Assignment not found")
        if assignment.actor_status != int(TaskActorStatusTypes.ACCEPTED):
            raise ValueError("Actor has not accepted the task")

        task.actor_id = actor_id
        task.status = TaskStatusTypes.ASSIGNED
        task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await self.task_repo.update_task(task)

        return TaskAssignmentResponseDTO.model_validate(assignment)

    async def get_my_assignments(
        self,
        actor_id: int,
        actor_status: int | None = None,
        task_id: int | None = None,
    ) -> list[TaskAssignmentResponseDTO]:
        return await self.task_assignment_repo.get_task_assignment_filtered(
            TaskAssignmentRequestDTO(
                actor_id=actor_id,
                actor_status=actor_status,
                task_id=task_id,
            )
        )

    async def get_publisher_view(
        self,
        publisher_id: int,
        actor_status: int | None = None,
        task_id: int | None = None,
        actor_id: int | None = None,
    ) -> TaskPublisherViewDTO:
        tasks = list(await self.task_repo.get_tasks_by_publisher_id(publisher_id))
        if task_id is not None:
            tasks = [t for t in tasks if t.id == task_id]

        assignments = await self.task_assignment_repo.get_task_assignments_by_publisher(
            publisher_id,
            TaskAssignmentRequestDTO(
                actor_id=actor_id,
                task_id=task_id,
                actor_status=actor_status,
            ),
        )
        return TaskPublisherViewDTO(tasks=tasks, assignments=assignments)
