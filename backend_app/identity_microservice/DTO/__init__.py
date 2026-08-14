"""Публичный API DTO: Request + Response в одном фасаде."""

from typing import TYPE_CHECKING, Any

__all__ = ["JwtResponseDTO", "UserAuthDTO", "UserCreateDTO", "UserResponseDTO"]

if TYPE_CHECKING:
    from backend_app.identity_microservice.DTO.Request import UserAuthDTO, UserCreateDTO
    from backend_app.identity_microservice.DTO.Response import JwtResponseDTO, UserResponseDTO


def __getattr__(name: str) -> Any:
    if name in {"UserAuthDTO", "UserCreateDTO"}:
        from backend_app.identity_microservice.DTO import Request as _request

        return getattr(_request, name)
    if name in {"JwtResponseDTO", "UserResponseDTO"}:
        from backend_app.identity_microservice.DTO import Response as _response

        return getattr(_response, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    return sorted({*globals(), *__all__})
