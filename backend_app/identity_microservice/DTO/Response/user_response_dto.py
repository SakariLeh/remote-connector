from pydantic import BaseModel, EmailStr, ConfigDict


class UserResponseDTO(BaseModel):
    id: int
    name: str = ""
    requires_password_change: bool = False
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)