from pydantic import BaseModel, EmailStr, ConfigDict

__all__ = ["UserResponseDTO"]


class UserResponseDTO(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)