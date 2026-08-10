from pydantic import BaseModel, EmailStr

class UserCreateDTO(BaseModel):
    email: EmailStr
    password: str
    role: str = "unauthorized"