"""Публичный API DTO: Request + Response в одном фасаде."""

from typing import TYPE_CHECKING, Any

__all__ = ["UserCreateDTO", "UserResponseDTO"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.DTO.Request import UserCreateDTO
    from backend_app.identity_microservice.DTO.Response import UserResponseDTO


def __getattr__(name: str) -> Any:
    if name == "UserCreateDTO":
        from backend_app.identity_microservice.DTO.Request import UserCreateDTO

        return UserCreateDTO
    if name == "UserResponseDTO":
        from backend_app.identity_microservice.DTO.Response import UserResponseDTO

        return UserResponseDTO
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
