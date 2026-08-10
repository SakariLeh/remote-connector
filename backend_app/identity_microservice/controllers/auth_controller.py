from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.identity_microservice.DTO import UserCreateDTO, UserResponseDTO
from backend_app.identity_microservice.db_context import get_db
from backend_app.identity_microservice.repositories import UserRepository
from backend_app.identity_microservice.services import IdentityService

__all__ = ["auth_router"]

# TODO: вынести в GenericController[TCreateDTO, TResponseDTO] (CRUD/auth роутер на дженериках)
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


# TODO: заменить на generic get_service[TService] / DI-контейнер
async def _get_identity_service(session: AsyncSession = Depends(get_db)) -> IdentityService:
    return IdentityService(UserRepository(session))


@auth_router.post(
    "/register",
    response_model=UserResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    response_description="Created user (without password)",
)
async def register(
    dto: UserCreateDTO,
    service: IdentityService = Depends(_get_identity_service),
) -> UserResponseDTO:
    try:
        return await service.register_new_user(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
