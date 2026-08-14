from pydantic import BaseModel, EmailStr, ConfigDict

__all__ = ["UserResponseDTO"]


class JwtResponseDTO(BaseModel):
    id: int
    email: EmailStr

    jwt_token: str