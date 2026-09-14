from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.tasks_microservice.DTO.Request.task_request_dto import TaskRequestDTO
from backend_app.tasks_microservice.DTO.Response.task_response_dto import TaskResponseDTO
from backend_app.tasks_microservice.db_context.database import get_db

from backend_app.tasks_microservice.repositories.task_repository import TaskRepository
from backend_app.tasks_microservice.services.task_service import TaskService


tasks_router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


async def _get_task_service(session: AsyncSession = Depends(get_db)) -> TaskService:
    return TaskService(TaskRepository(session))


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
    return await service.get_task_by_id(task_id)


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