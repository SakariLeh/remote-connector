import time
from uuid import uuid4

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, service_name: str | None = None):
        super().__init__(app)
        self.service_name = service_name

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid4())

        structlog.contextvars.clear_contextvars()
        context = {"request_id": request_id}
        if self.service_name is not None:
            context["service_name"] = self.service_name
        structlog.contextvars.bind_contextvars(**context)

        logger = structlog.get_logger("http")
        started = time.perf_counter()

        try:
            response = await call_next(request)

            response.headers["X-Request-ID"] = request_id

            logger.info("request completed", method=request.method, path=request.url.path, status_code=response.status_code, duration=time.perf_counter() - started)

            return response

        except Exception as e:
            logger.exception("request failed", method=request.method, path=request.url.path, error=str(e))

            raise e

        finally:
            structlog.contextvars.clear_contextvars()