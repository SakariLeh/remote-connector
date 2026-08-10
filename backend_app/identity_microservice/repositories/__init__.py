"""Публичный API repositories. Ленивый экспорт разрывает циклы со services/controllers."""

from typing import TYPE_CHECKING, Any

__all__ = ["UserRepository"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.repositories.user_repository import UserRepository


def __getattr__(name: str) -> Any:
    if name in __all__:
        from backend_app.identity_microservice.repositories import user_repository as _mod

        return getattr(_mod, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
