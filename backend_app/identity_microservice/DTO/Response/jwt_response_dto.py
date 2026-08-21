from pydantic import BaseModel, EmailStr

__all__ = ["JwtResponseDTO"]


class JwtResponseDTO(BaseModel):
    id: int
    email: EmailStr
    jwt_token: str
