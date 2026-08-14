import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from backend_app.identity_microservice.DTO import UserCreateDTO, UserResponseDTO
from backend_app.identity_microservice.DTO.Request.user_auth_dto import UserAuthDTO
from backend_app.identity_microservice.DTO.Response.jwt_response_dto import JwtResponseDTO
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

    async def authorize_user(self, auth_dto: UserAuthDTO) -> JwtResponseDTO:
        """Authorize a user and return an auth token.

        Raise ValueError for missing user, invalid password or other failures.
        """
        try:
            user = await self.user_repo.get_user_by_email(auth_dto.email)
            if not user:
                raise ValueError("User not found")

            try:
                self.ph.verify(user.hashed_password, password)
            except VerifyMismatchError:
                raise ValueError("Invalid password") from None
            
            jwt_token = jwt.encode(
                {
                    "sub": user.id,
                    "email": user.email,
                    "role": user.role,
                },
                # TODO: Заменить на соль из .env
                # settings.JWT_SECRET,
                "secret",
                algorithm="HS256",
            )
            response = JwtResponseDTO(id=user.id, email=user.email, jwt_token=jwt_token)

            return response
        except ValueError:
            raise
        except Exception as error:
            raise ValueError("Authorization failed") from error
