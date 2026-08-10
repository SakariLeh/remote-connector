from argon2 import PasswordHasher

from backend_app.identity_microservice.DTO import UserCreateDTO, UserResponseDTO
from backend_app.identity_microservice.entities import UserEntity
from backend_app.identity_microservice.repositories import UserRepository

__all__ = ["IdentityService"]


# TODO: заменить на GenericService[TCreateDTO, TResponseDTO, TRepository]
class IdentityService:
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository
        self.ph = PasswordHasher()

    async def register_new_user(self, dto: UserCreateDTO) -> UserResponseDTO:
        existing_user = await self.user_repo.get_user_by_email(dto.email)
        if existing_user:
            raise ValueError("User with this email already exists")

        hashed_pass = self.ph.hash(dto.password)

        new_user = UserEntity(email=dto.email, hashed_password=hashed_pass, role=dto.role)
        created_user = await self.user_repo.create_user(new_user)

        return created_user
