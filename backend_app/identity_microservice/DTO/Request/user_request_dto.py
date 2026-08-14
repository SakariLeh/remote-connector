from pydantic import BaseModel, EmailStr

__all__ = ["UserRequestDTO"]


class UserRequestDTO(BaseModel):
    id: int
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None
