from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.shared.jwt_authentication import CurrentUser, get_current_user, require_auth
from backend_app.tasks_microservice.DTO import TaskCreateDTO, TaskRequestDTO, TaskResponseDTO
from backend_app.tasks_microservice.db_context import get_db
from backend_app.tasks_microservice.repositories import TaskRepository
from backend_app.tasks_microservice.services import TaskService

tasks_router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


async def _get_task_service(session: AsyncSession = Depends(get_db)) -> TaskService:
    return TaskService(TaskRepository(session))


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
    return await service.create_task(dto, current_user.user_id)


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
