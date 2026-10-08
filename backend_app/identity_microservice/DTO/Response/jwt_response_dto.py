from pydantic import BaseModel, EmailStr


class JwtResponseDTO(BaseModel):
    id: int
    email: EmailStr
    jwt_token: str
