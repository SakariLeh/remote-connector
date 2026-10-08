from fastapi import Request
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse

from backend_app.shared.exception_handling.exceptions import AppException
from backend_app.shared.exception_handling.models import ErrorResponse


def _error_response(*, status_code: int, code: str, message: str, details=None) -> JSONResponse:
    payload = ErrorResponse(
        success=False,
        error={"code": code, "message": message, "details": details},
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump())


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return _error_response(
        status_code=exc.status_code,
        code=exc.error_code,
        message=exc.message,
        details=exc.details,
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict):
        message = detail.get("message", "HTTP request failed")
        code = detail.get("code", "HTTP_REQUEST_FAILED")
        details = detail.get("details", None)

    else:
        message = str(detail)
        code = "HTTP_ERROR"
        details = None

    return _error_response(status_code=exc.status_code, code=code, message=message, details=details)


async def starlette_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return _error_response(status_code=exc.status_code, code="HTTP_ERROR", message=str(exc))


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return _error_response(status_code=500, code="INTERNAL_SERVER_ERROR", message="An unexpected error occurred")
