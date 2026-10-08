from pydantic import BaseModel, EmailStr, Field


class UpdateProfileDTO(BaseModel):
    email: EmailStr
    password: str | None = Field(default=None, min_length=6)
