from fastapi import Request
from starlette.exceptions import HTTPException

from backend_app.shared.jwt_authentication.models import CurrentUser


def get_current_user(request: Request) -> CurrentUser:
    current_user = getattr(request.state, "current_user", None)
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
