from pydantic import BaseModel, EmailStr, ConfigDict


class UserResponseDTO(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)