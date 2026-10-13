from pydantic import BaseModel, EmailStr


class UpdateProfileDTO(BaseModel):
    email: EmailStr
