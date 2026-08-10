"""Публичный API db_context."""

from typing import TYPE_CHECKING, Any

__all__ = ["DATABASE_URL", "AsyncSessionLocal", "engine", "get_db"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.db_context.database import (
        DATABASE_URL,
        AsyncSessionLocal,
        engine,
        get_db,
    )


def __getattr__(name: str) -> Any:
    if name in __all__:
        from backend_app.identity_microservice.db_context import database as _mod

        return getattr(_mod, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
