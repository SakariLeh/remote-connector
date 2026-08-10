"""Публичный API entities. Ленивый экспорт — без циклов при взаимных ссылках слоёв."""

from typing import TYPE_CHECKING, Any

__all__ = ["Base", "UserEntity"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.entities.user_entity import Base, UserEntity


def __getattr__(name: str) -> Any:
    if name in __all__:
        from backend_app.identity_microservice.entities import user_entity as _mod

        return getattr(_mod, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
