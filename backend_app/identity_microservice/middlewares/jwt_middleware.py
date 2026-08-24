from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# ponytail: hardcoded secret, move to settings/.env when shared config exists
JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME_NOW!!"
JWT_ALGORITHM = "HS256"
_TOKEN_TTL = timedelta(hours=24)

jwt_scheme = HTTPBearer(
    bearerFormat="JWT",
    scheme_name="JWT",
    description="Paste `jwt_token` from POST /auth/authorize. Swagger sends `Authorization: Bearer <token>`.",
    auto_error=True,
)


@dataclass(frozen=True, slots=True)
class CurrentUser:
    user_id: int
    email: str
    role: str


def create_access_token(user_id: int, email: str, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + _TOKEN_TTL,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(
    credentials_or_none: Annotated[HTTPAuthorizationCredentials, Depends(jwt_scheme)] = None
) -> CurrentUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        
        payload = jwt.decode(
            credentials_or_none.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        if user_id is None or email is None or role is None:
            raise credentials_exception
        return CurrentUser(user_id=int(user_id), email=email, role=role)
    except (jwt.PyJWTError, TypeError, ValueError):
        raise credentials_exception from None


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user