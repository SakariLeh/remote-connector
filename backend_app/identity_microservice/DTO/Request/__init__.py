"""Публичный API request DTO."""

from typing import TYPE_CHECKING, Any

__all__ = ["UserCreateDTO"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.DTO.Request.user_create_dto import UserCreateDTO


def __getattr__(name: str) -> Any:
    if name in __all__:
        from backend_app.identity_microservice.DTO.Request import user_create_dto as _mod

        return getattr(_mod, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
