import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from backend_app.identity_microservice.entities.user_entity import UserEntity
from backend_app.identity_microservice.repositories.user_repository import UserRepository
from backend_app.identity_microservice.DTO.Request.user_create_dto import UserCreateDTO
from backend_app.identity_microservice.DTO.Response.user_response_dto import UserResponseDTO


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