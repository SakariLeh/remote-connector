from pydantic import BaseModel, Field


class ChangePasswordDTO(BaseModel):
    old_password: str = Field(min_length=1)
    new_password: str = Field(min_length=1)
