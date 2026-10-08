from datetime import datetime, timedelta, timezone

import jwt

from backend_app.shared.jwt_authentication.models import CurrentUser

JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME_NOW!!"
JWT_ALGORITHM = "HS256"
_TOKEN_TTL = timedelta(hours=24)


def create_access_token(user_id: int, email: str, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + _TOKEN_TTL,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> CurrentUser:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    user_id = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role")
    if user_id is None or email is None or role is None:
        raise ValueError("Invalid token payload")
    return CurrentUser(user_id=int(user_id), email=str(email), role=str(role))
