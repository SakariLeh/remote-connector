from pydantic import BaseModel, EmailStr


class UpdateProfileDTO(BaseModel):
    name: str = ""
    email: EmailStr
