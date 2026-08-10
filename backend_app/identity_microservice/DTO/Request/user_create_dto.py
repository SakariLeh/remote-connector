from pydantic import BaseModel, EmailStr

__all__ = ["UserCreateDTO"]


class UserCreateDTO(BaseModel):
    email: EmailStr
    password: str
    role: str = "unauthorized"