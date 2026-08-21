from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.identity_microservice.DTO import (
    JwtResponseDTO,
    UserAuthDTO,
    UserCreateDTO,
    UserResponseDTO,
)
from backend_app.identity_microservice.db_context import get_db
from backend_app.identity_microservice.repositories import UserRepository
from backend_app.identity_microservice.services import IdentityService

__all__ = ["auth_router"]

# TODO
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


# TODO
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


@auth_router.post(
    "/authorize",
    response_model=JwtResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Authorize a user",
    response_description="JWT token",
)
async def authorize(auth_dto: UserAuthDTO, service: IdentityService = Depends(_get_identity_service)) -> JwtResponseDTO:
    try:
        return await service.authorize_user(auth_dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e