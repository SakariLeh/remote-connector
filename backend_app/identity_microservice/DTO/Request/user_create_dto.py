from pydantic import BaseModel, EmailStr


class UserCreateDTO(BaseModel):
    name: str = ""
    email: EmailStr
    password: str
    role: str = "user"