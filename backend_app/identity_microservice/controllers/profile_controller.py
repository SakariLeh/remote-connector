from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.identity_microservice.DTO import UserRequestDTO, UserResponseDTO
from backend_app.identity_microservice.db_context import get_db
from backend_app.identity_microservice.repositories import UserRepository
from backend_app.identity_microservice.services import UserService


profile_router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


async def _get_user_service(session: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(session))


@profile_router.get(
    "/{user_id}",
    response_model=UserResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Get user profile",
    response_description="User profile",
)
async def get_user(
    user_id: int,
    service: UserService = Depends(_get_user_service),
) -> UserResponseDTO:
    user = await service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@profile_router.post(
    "/update",
    response_model=UserResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
    response_description="Updated user profile",
)
async def update_user(
    dto: UserRequestDTO,
    service: UserService = Depends(_get_user_service),
) -> UserResponseDTO:
    try:
        return await service.update_user(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@profile_router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user profile",
)
async def delete_user(
    user_id: int,
    service: UserService = Depends(_get_user_service),
) -> None:
    deleted = await service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@profile_router.get(
    "/",
    response_model=list[UserResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="Get all users",
    response_description="List of all users",
)
async def get_users(
    service: UserService = Depends(_get_user_service),
) -> list[UserResponseDTO]:
    return await service.get_all_users()


@profile_router.get("/me", response_model=UserResponseDTO, status_code=status.HTTP_200_OK, summary="Get current user profile", response_description="Current user profile")
async def get_current_user(service: UserService = Depends(_get_user_service)) -> UserResponseDTO:
    try:
        return await service.get_current_user()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e