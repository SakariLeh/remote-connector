from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from backend_app.identity_microservice.DTO import (
    JwtResponseDTO,
    UserAuthDTO,
    UserCreateDTO,
    UserResponseDTO,
)
from backend_app.identity_microservice.entities import UserEntity
from backend_app.identity_microservice.middlewares import create_access_token
from backend_app.identity_microservice.repositories import UserRepository

__all__ = ["IdentityService"]


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

    async def authorize_user(self, auth_dto: UserAuthDTO) -> JwtResponseDTO:
        """Authorize a user and return a JWT wrapped in JwtResponseDTO."""
        try:
            user = await self.user_repo.get_user_entity_by_email(auth_dto.email)
            if not user:
                raise ValueError("User not found")

            try:
                self.ph.verify(user.hashed_password, auth_dto.password)
            except VerifyMismatchError:
                raise ValueError("Invalid password") from None

            jwt_token = create_access_token(user.id, user.email, user.role)
            return JwtResponseDTO(id=user.id, email=user.email, jwt_token=jwt_token)
        except ValueError:
            raise
        except Exception as error:
            raise ValueError("Authorization failed") from error
