from pydantic import BaseModel, EmailStr


class UpdateProfileDTO(BaseModel):
    email: EmailStr
    password: str | None = Field(default=None, min_length=6)
    role: str | None = Field(default=None)
