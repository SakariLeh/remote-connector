"""Публичный API controllers. Ленивый экспорт — роутеры не грузятся при импорте соседних слоёв."""

from typing import TYPE_CHECKING, Any

__all__ = ["auth_router"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.controllers.auth_controller import auth_router


def __getattr__(name: str) -> Any:
    if name in __all__:
        from backend_app.identity_microservice.controllers import auth_controller as _mod

        return getattr(_mod, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
