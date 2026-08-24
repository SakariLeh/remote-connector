from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend_app.shared.exception_handling.exceptions import AppException
from backend_app.shared.exception_handling.middleware import (
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
)


def setup_exception_handling(app: FastAPI) -> FastAPI:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    return app
