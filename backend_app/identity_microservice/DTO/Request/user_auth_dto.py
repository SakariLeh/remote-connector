from pydantic import BaseModel, EmailStr


class UserAuthDTO(BaseModel):
    email: EmailStr
    password: str