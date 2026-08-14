from backend_app.identity_microservice.DTO import UserResponseDTO
from backend_app.identity_microservice.DTO.Request.user_request_dto import UserRequestDTO
from backend_app.identity_microservice.repositories import UserRepository

from backend_app.identity_microservice.entities import UserEntity

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository

    async def get_user_by_id(self, user_id: int) -> UserResponseDTO | None:
        return await self.user_repo.get_user_by_id(user_id)

    async def get_user_by_email(self, email: str) -> UserResponseDTO | None:
        return await self.user_repo.get_user_by_email(email)

    async def get_all_users(self) -> list[UserResponseDTO]:
        return list[UserResponseDTO](await self.user_repo.get_all_users())

    async def update_user(self, user: UserRequestDTO) -> UserResponseDTO | None:
        existing_user = await self.user_repo.get_user_entity_by_id(user.id)
        if not existing_user:
            raise ValueError("User not found")

        if user.email is not None:
            existing_user.email = user.email
        if user.password is not None:
            existing_user.hashed_password = self.ph.hash(user.password)
        if user.role is not None:
            existing_user.role = user.role
            
        user_entity = UserEntity(
            id=existing_user.id,
            email=existing_user.email,
            hashed_password=existing_user.hashed_password,
            role=existing_user.role,
        )

        return await self.user_repo.update_user(user_entity)

    async def delete_user(self, user_id: int) -> bool:
        return await self.user_repo.delete_user(user_id)