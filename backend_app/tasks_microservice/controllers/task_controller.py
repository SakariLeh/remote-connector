from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.shared.jwt_authentication import CurrentUser, get_current_user, require_auth
from backend_app.tasks_microservice.DTO import (
    TaskAssignmentResponseDTO,
    TaskCreateDTO,
    TaskPublisherViewDTO,
    TaskRequestDTO,
    TaskResponseDTO,
    TaskSelectActorDTO,
)
from backend_app.tasks_microservice.db_context import get_db
from backend_app.tasks_microservice.repositories import (
    TaskAssignmentRepository,
    TaskRepository,
)
from backend_app.tasks_microservice.services import TaskAssignmentService, TaskService

tasks_router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


async def _get_task_service(session: AsyncSession = Depends(get_db)) -> TaskService:
    return TaskService(TaskRepository(session))


async def _get_task_assignment_service(
    session: AsyncSession = Depends(get_db),
) -> TaskAssignmentService:
    return TaskAssignmentService(
        TaskAssignmentRepository(session),
        TaskRepository(session),
    )


@require_auth
@tasks_router.post(
    "/",
    response_model=TaskResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Create task",
    response_description="Created task",
)
async def create_task(
    dto: TaskCreateDTO,
    current_user: CurrentUser = Depends(get_current_user),
    service: TaskService = Depends(_get_task_service),
) -> TaskResponseDTO:
    try:
        return await service.create_task(dto, current_user.user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@require_auth
@tasks_router.get(
    "/unassigned",
    response_model=list[TaskResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="Get unassigned tasks",
    response_description="List of tasks without an executor",
)
async def get_unassigned_tasks(
    service: TaskService = Depends(_get_task_service),
) -> list[TaskResponseDTO]:
    return await service.get_unassigned_tasks()


@require_auth
@tasks_router.get(
    "/me/assignments",
    response_model=list[TaskAssignmentResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="Get my task assignments",
    response_description="Assignments where current user is the actor",
)
async def get_my_assignments(
    actor_status: int | None = Query(default=None),
    task_id: int | None = Query(default=None),
    current_user: CurrentUser = Depends(get_current_user),
    service: TaskAssignmentService = Depends(_get_task_assignment_service),
) -> list[TaskAssignmentResponseDTO]:
    return await service.get_my_assignments(
        current_user.user_id,
        actor_status=actor_status,
        task_id=task_id,
    )


@require_auth
@tasks_router.get(
    "/me/published",
    response_model=TaskPublisherViewDTO,
    status_code=status.HTTP_200_OK,
    summary="Get my published tasks with assignments",
    response_description="Tasks published by current user and their assignments",
)
async def get_my_published(
    actor_status: int | None = Query(default=None),
    task_id: int | None = Query(default=None),
    actor_id: int | None = Query(default=None),
    current_user: CurrentUser = Depends(get_current_user),
    service: TaskAssignmentService = Depends(_get_task_assignment_service),
) -> TaskPublisherViewDTO:
    return await service.get_publisher_view(
        current_user.user_id,
        actor_status=actor_status,
        task_id=task_id,
        actor_id=actor_id,
    )


@require_auth
@tasks_router.post(
    "/{task_id}/subscribe",
    response_model=TaskAssignmentResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Subscribe to task",
    response_description="Created task assignment",
)
async def subscribe_to_task(
    task_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    service: TaskAssignmentService = Depends(_get_task_assignment_service),
) -> TaskAssignmentResponseDTO:
    try:
        return await service.subscribe(task_id, current_user.user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@require_auth
@tasks_router.post(
    "/{task_id}/decline",
    response_model=TaskAssignmentResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Decline task assignment",
    response_description="Updated task assignment",
)
async def decline_task(
    task_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    service: TaskAssignmentService = Depends(_get_task_assignment_service),
) -> TaskAssignmentResponseDTO:
    try:
        return await service.decline(task_id, current_user.user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@require_auth
@tasks_router.post(
    "/{task_id}/select-actor",
    response_model=TaskAssignmentResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Select actor for task",
    response_description="Selected actor assignment",
)
async def select_actor(
    task_id: int,
    dto: TaskSelectActorDTO,
    current_user: CurrentUser = Depends(get_current_user),
    service: TaskAssignmentService = Depends(_get_task_assignment_service),
) -> TaskAssignmentResponseDTO:
    try:
        return await service.select_actor(task_id, current_user.user_id, dto.actor_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@require_auth
@tasks_router.get(
    "/{task_id}",
    response_model=TaskResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Get task",
    response_description="Task",
)
async def get_task(
    task_id: int,
    service: TaskService = Depends(_get_task_service),
) -> TaskResponseDTO:
    task = await service.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@require_auth
@tasks_router.get(
    "/",
    response_model=list[TaskResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="Get all tasks",
    response_description="List of all tasks",
)
async def get_tasks(
    service: TaskService = Depends(_get_task_service),
) -> list[TaskResponseDTO]:
    return await service.get_all_tasks()


@require_auth
@tasks_router.post(
    "/update",
    response_model=TaskResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Update task",
    response_description="Updated task",
)
async def update_task(
    dto: TaskRequestDTO,
    service: TaskService = Depends(_get_task_service),
) -> TaskResponseDTO:
    try:
        return await service.update_task(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@require_auth
@tasks_router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
)
async def delete_task(
    task_id: int,
    service: TaskService = Depends(_get_task_service),
) -> None:
    deleted = await service.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
