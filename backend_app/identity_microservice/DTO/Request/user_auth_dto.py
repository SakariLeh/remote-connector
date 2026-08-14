from pydantic import BaseModel, EmailStr

__all__ = ["UserAuthDTO"]


class UserAuthDTO(BaseModel):
    email: EmailStr
    password: str