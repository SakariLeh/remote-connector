from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from pydantic import SecretStr

from backend_app.identity_microservice.DTO import (
    JwtResponseDTO,
    UserAuthDTO,
    UserCreateDTO,
    UserCredentialsDTO,
    UserResponseDTO,
)
from backend_app.identity_microservice.repositories import UserRepository
from backend_app.shared.jwt_authentication import create_access_token


class IdentityService:
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository
        self.ph = PasswordHasher()

    async def register_new_user(self, dto: UserCreateDTO) -> UserResponseDTO:
        existing_user = await self.user_repo.get_user_by_email(dto.email)
        if existing_user:
            raise ValueError("User with this email already exists")

        hashed_pass = self.ph.hash(dto.password)
        created_user = await self.user_repo.create_user(
            UserCredentialsDTO(
                email=dto.email,
                hashed_password=SecretStr(hashed_pass),
                role=dto.role,
            )
        )
        return created_user

    async def authorize_user(self, auth_dto: UserAuthDTO) -> JwtResponseDTO:
        """Authorize a user and return a JWT wrapped in JwtResponseDTO."""
        try:
            user = await self.user_repo.get_user_credentials_by_email(auth_dto.email)
            if (
                not user
                or user.id is None
                or user.email is None
                or user.role is None
                or user.hashed_password is None
            ):
                raise ValueError("User not found")

            try:
                self.ph.verify(user.hashed_password.get_secret_value(), auth_dto.password)
            except VerifyMismatchError:
                raise ValueError("Invalid password") from None

            jwt_token = create_access_token(user.id, user.email, user.role)
            return JwtResponseDTO(id=user.id, email=user.email, jwt_token=jwt_token)
        except ValueError:
            raise
        except Exception as error:
            raise ValueError(f"Unexpected error during authorization: {error}") from error
