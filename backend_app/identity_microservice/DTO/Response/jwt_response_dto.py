from pydantic import BaseModel, EmailStr


class JwtResponseDTO(BaseModel):
    id: int
    email: EmailStr
    requires_password_change: bool = False
    jwt_token: str
