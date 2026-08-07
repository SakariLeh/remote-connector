from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from entities.user_entity import UserEntity
from DTO.Request.user_create_dto import UserCreateDTO
from DTO.Response.user_response_dto import UserResponseDTO


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    async def get_user_by_id(self, user_id: int) -> UserResponseDTO | None:
        result = await self.db.execute(
            select(UserEntity).where(UserEntity.id == user_id)
            )
        return UserResponseDTO.model_validate(result.scalar_one_or_none())

    async def get_user_by_email(self, email: str) -> UserResponseDTO | None:
        result = await self.db.execute(
            select(UserEntity).where(UserEntity.email == email)
            )
        return UserResponseDTO.model_validate(result.scalar_one_or_none())

    async def get_all_users(self) -> Sequence[UserEntity]:
        result = await self.db.execute(select(UserEntity))
        dto_result = Sequence[UserResponseDTO]
        for user in result.scalars().all():
            dto_result.append(UserResponseDTO.model_validate(user))
        return dto_result


    async def create_user(self, user: UserEntity) -> UserResponseDTO:
        self.db.add(user)
        await self.session.commit()
        created_user = await self.db.refresh(user)
        return UserResponseDTO.model_validate(created_user)