from pydantic import BaseModel, EmailStr


class UserRequestDTO(BaseModel):
    id: int
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None
