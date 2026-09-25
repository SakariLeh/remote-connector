from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend_app.identity_microservice.DTO import UserCredentialsDTO, UserResponseDTO
from backend_app.identity_microservice.entities import UserEntity


# TODO: заменить на GenericRepository[TEntity, TResponseDTO]
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.db = session

    async def _get_entity_by_id(self, user_id: int) -> UserEntity | None:
        result = await self.db.execute(select(UserEntity).where(UserEntity.id == user_id))
        return result.scalar_one_or_none()

    async def _get_entity_by_email(self, email: str) -> UserEntity | None:
        result = await self.db.execute(select(UserEntity).where(UserEntity.email == email))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> UserResponseDTO | None:
        user = await self._get_entity_by_id(user_id)
        return UserResponseDTO.model_validate(user) if user else None

    async def get_user_by_email(self, email: str) -> UserResponseDTO | None:
        user = await self._get_entity_by_email(email)
        return UserResponseDTO.model_validate(user) if user else None

    async def get_user_credentials_by_email(self, email: str) -> UserCredentialsDTO | None:
        user = await self._get_entity_by_email(email)
        return UserCredentialsDTO.model_validate(user) if user else None

    async def get_all_users(self) -> Sequence[UserResponseDTO]:
        result = await self.db.execute(select(UserEntity))
        return [UserResponseDTO.model_validate(user) for user in result.scalars().all()]

    async def create_user(self, dto: UserCredentialsDTO) -> UserResponseDTO:
        if dto.email is None or dto.hashed_password is None or dto.role is None:
            raise ValueError("email, hashed_password and role are required to create a user")

        user = UserEntity(
            email=dto.email,
            hashed_password=dto.hashed_password.get_secret_value(),
            role=dto.role,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return UserResponseDTO.model_validate(user)

    async def update_user(self, dto: UserCredentialsDTO) -> UserResponseDTO | None:
        if dto.id is None:
            raise ValueError("id is required to update a user")

        user = await self._get_entity_by_id(dto.id)
        if not user:
            return None

        if dto.email is not None:
            user.email = dto.email
        if dto.role is not None:
            user.role = dto.role
        if dto.hashed_password is not None:
            user.hashed_password = dto.hashed_password.get_secret_value()

        await self.db.commit()
        await self.db.refresh(user)
        return UserResponseDTO.model_validate(user)

    async def delete_user(self, user_id: int) -> bool:
        user = await self._get_entity_by_id(user_id)
        if not user:
            return False
        await self.db.delete(user)
        await self.db.commit()
        return True
