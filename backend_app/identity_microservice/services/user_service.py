from argon2 import PasswordHasher

from backend_app.identity_microservice.DTO import UserRequestDTO, UserResponseDTO
from backend_app.identity_microservice.middlewares import CurrentUser, get_current_user
from backend_app.identity_microservice.repositories import UserRepository


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository
        self.ph = PasswordHasher()

    async def get_user_by_id(self, user_id: int) -> UserResponseDTO | None:
        return await self.user_repo.get_user_by_id(user_id)

    async def get_user_by_email(self, email: str) -> UserResponseDTO | None:
        return await self.user_repo.get_user_by_email(email)

    async def get_all_users(self) -> list[UserResponseDTO]:
        return list (await self.user_repo.get_all_users())

    async def update_user(self, user: UserRequestDTO) -> UserResponseDTO:
        existing_user = await self.user_repo.get_user_entity_by_id(user.id)
        if not existing_user:
            raise ValueError("User not found")

        if user.email is not None:
            existing_user.email = user.email
        if user.password is not None:
            existing_user.hashed_password = self.ph.hash(user.password)
        if user.role is not None:
            existing_user.role = user.role

        updated = await self.user_repo.update_user(existing_user)
        if not updated:
            raise ValueError("User not found")
        return updated

    async def delete_user(self, user_id: int) -> bool:
        return await self.user_repo.delete_user(user_id)


    async def get_current_user(self) -> UserResponseDTO:
        try:
            user: CurrentUser = await get_current_user()
            return UserResponseDTO(id=8, email="user2@example.com", role="admin")
        except ValueError as error:
            raise ValueError("Failed to get current user") from error