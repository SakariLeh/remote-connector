import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from backend_app.identity_microservice.DTO import UserCreateDTO, UserResponseDTO
from backend_app.identity_microservice.entities import UserEntity
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

    async def authorize_user(self, email: str, password: str) -> str:
        try:
            user = await self.user_repo.get_user_by_email(email)
            if not user:
                raise ValueError("User nor found")

            try:
                self.ph.verify(user.hashed_password, password)
            except VerifyMismatchError:
                raise ValueError("Invalid password") from None

            return secrets.token_urlsafe(32)
        except ValueError:
            raise
        except Exception as error:
            raise ValueError("Authorization failed") from error

    async def get_user_by_id(self, user_id: int) -> UserResponseDTO | None:
        return await self.user_repo.get_user_by_id(user_id)

    async def get_user_by_email(self, email: str) -> UserResponseDTO | None:
        return await self.user_repo.get_user_by_email(email)

    async def get_all_users(self):
        return await self.user_repo.get_all_users()

    async def update_user(self, user_id: int, email: str | None = None, password: str | None = None, role: str | None = None) -> UserResponseDTO | None:
        kwargs = {}
        if email is not None:
            kwargs["email"] = email
        if password is not None:
            kwargs["hashed_password"] = self.ph.hash(password)
        if role is not None:
            kwargs["role"] = role
        if not kwargs:
            return await self.user_repo.get_user_by_id(user_id)
        return await self.user_repo.update_user(user_id, **kwargs)

    async def delete_user(self, user_id: int) -> bool:
        return await self.user_repo.delete_user(user_id)
