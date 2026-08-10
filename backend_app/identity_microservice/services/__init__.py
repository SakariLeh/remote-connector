"""Публичный API services. Ленивый экспорт разрывает циклы с repositories/controllers."""

from typing import TYPE_CHECKING, Any

__all__ = ["IdentityService"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.services.identity_service import IdentityService


def __getattr__(name: str) -> Any:
    if name in __all__:
        from backend_app.identity_microservice.services import identity_service as _mod

        return getattr(_mod, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
