"""Публичный API response DTO."""

from typing import TYPE_CHECKING, Any

__all__ = ["JwtResponseDTO", "UserResponseDTO"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.DTO.Response.jwt_response_dto import JwtResponseDTO
    from backend_app.identity_microservice.DTO.Response.user_response_dto import UserResponseDTO


def __getattr__(name: str) -> Any:
    if name == "JwtResponseDTO":
        from backend_app.identity_microservice.DTO.Response import jwt_response_dto as _mod

        return getattr(_mod, name)
    if name == "UserResponseDTO":
        from backend_app.identity_microservice.DTO.Response import user_response_dto as _mod

        return getattr(_mod, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
