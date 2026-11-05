from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.shared.jwt_authentication import allow_anonymous, require_auth
from backend_app.tasks_microservice.DTO import (
    TaskCategoryCreateDTO,
    TaskCategoryRequestDTO,
    TaskCategoryResponseDTO,
)
from backend_app.tasks_microservice.db_context import get_db
from backend_app.tasks_microservice.repositories import TaskCategoryRepository
from backend_app.tasks_microservice.services import TaskCategoryService

task_categories_router = APIRouter(
    prefix="/task-categories",
    tags=["Task categories"],
)


async def _get_task_category_service(
    session: AsyncSession = Depends(get_db),
) -> TaskCategoryService:
    return TaskCategoryService(TaskCategoryRepository(session))


@require_auth
@task_categories_router.post(
    "/",
    response_model=TaskCategoryResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Create task category",
    response_description="Created task category",
)
async def create_task_category(
    dto: TaskCategoryCreateDTO,
    service: TaskCategoryService = Depends(_get_task_category_service),
) -> TaskCategoryResponseDTO:
    return await service.create_category(dto)


@allow_anonymous
@task_categories_router.get(
    "/",
    response_model=list[TaskCategoryResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="Get all task categories",
    response_description="List of task categories",
)
async def get_task_categories(
    service: TaskCategoryService = Depends(_get_task_category_service),
) -> list[TaskCategoryResponseDTO]:
    return await service.get_all_categories()


@allow_anonymous
@task_categories_router.get(
    "/{category_id}",
    response_model=TaskCategoryResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Get task category",
    response_description="Task category",
)
async def get_task_category(
    category_id: int,
    service: TaskCategoryService = Depends(_get_task_category_service),
) -> TaskCategoryResponseDTO:
    category = await service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task category not found")
    return category


@require_auth
@task_categories_router.post(
    "/update",
    response_model=TaskCategoryResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Update task category",
    response_description="Updated task category",
)
async def update_task_category(
    dto: TaskCategoryRequestDTO,
    service: TaskCategoryService = Depends(_get_task_category_service),
) -> TaskCategoryResponseDTO:
    try:
        return await service.update_category(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@require_auth
@task_categories_router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task category",
)
async def delete_task_category(
    category_id: int,
    service: TaskCategoryService = Depends(_get_task_category_service),
) -> None:
    deleted = await service.delete_category(category_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task category not found")
