from pydantic import BaseModel, ConfigDict, EmailStr, SecretStr


class UserCredentialsDTO(BaseModel):
    id: int | None = None
    email: EmailStr | None = None
    role: str | None = None
    hashed_password: SecretStr | None = None

    model_config = ConfigDict(from_attributes=True)
