from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.identity_microservice.DTO.Response.user_response_dto import UserResponseDTO
from backend_app.identity_microservice.entities.user_entity import UserEntity


# TODO: заменить на GenericRepository[TEntity, TResponseDTO]
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    async def get_user_by_id(self, user_id: int) -> UserResponseDTO | None:
        result = await self.db.execute(select(UserEntity).where(UserEntity.id == user_id))
        user = result.scalar_one_or_none()
        return UserResponseDTO.model_validate(user) if user else None

    async def get_user_by_email(self, email: str) -> UserResponseDTO | None:
        result = await self.db.execute(select(UserEntity).where(UserEntity.email == email))
        user = result.scalar_one_or_none()
        return UserResponseDTO.model_validate(user) if user else None

    async def get_all_users(self) -> Sequence[UserResponseDTO]:
        result = await self.db.execute(select(UserEntity))
        return [UserResponseDTO.model_validate(user) for user in result.scalars().all()]

    async def create_user(self, user: UserEntity) -> UserResponseDTO:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return UserResponseDTO.model_validate(user)
