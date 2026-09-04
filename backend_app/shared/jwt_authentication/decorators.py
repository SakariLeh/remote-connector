from collections.abc import Callable
from typing import Any, TypeVar

from fastapi import Depends

from backend_app.shared.jwt_authentication.dependencies import get_current_user
from backend_app.shared.jwt_authentication.models import CurrentUser
Endpoint = TypeVar("Endpoint", bound=Callable[..., Any])


def require_roles(*roles: str) -> Callable[[Endpoint], Endpoint]:
    if not roles or any(not role for role in roles):
        raise ValueError("At least one non-empty role is required")

    def decorator(endpoint: Endpoint) -> Endpoint:
        setattr(endpoint, "required_roles", frozenset(roles))
        return endpoint

    return decorator


def allow_anonymous(endpoint: Endpoint) -> Endpoint:
    setattr(endpoint, "allow_anonymous", True)
    return endpoint


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = frozenset(allowed_roles)

    def __call__(self, current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in self.allowed_roles:
            from starlette.exceptions import HTTPException

            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
