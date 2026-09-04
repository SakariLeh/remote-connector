from collections.abc import Iterable

import jwt
from fastapi import Request
from starlette.exceptions import HTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response

from backend_app.shared.jwt_authentication.models import CurrentUser
from backend_app.shared.jwt_authentication.tokens import decode_access_token


class JWTAuthenticationMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        public_paths: Iterable[str] = (),
    ):
        super().__init__(app)
        self.public_paths = frozenset(public_paths)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        endpoint = self._get_endpoint(request)
        if self._is_public(request, endpoint):
            return await call_next(request)

        try:
            current_user = self._authenticate(request)
        except HTTPException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail},
                headers=exc.headers,
            )
        request.state.current_user = current_user

        required_roles = getattr(endpoint, "required_roles", frozenset())
        if required_roles and current_user.role not in required_roles:
            return JSONResponse(status_code=403, content={"detail": "Insufficient permissions"})

        return await call_next(request)

    def _get_endpoint(self, request: Request):
        router = getattr(request.app, "router", None)
        if router is None:
            return None
        for route in router.routes:
            path_regex = getattr(route, "path_regex", None)
            methods = getattr(route, "methods", None)
            if path_regex is not None and path_regex.match(request.url.path) and (
                methods is None or request.method in methods
            ):
                return getattr(route, "endpoint", None)
        return None

    def _is_public(self, request: Request, endpoint) -> bool:
        return request.url.path in self.public_paths or getattr(endpoint, "allow_anonymous", False)

    @staticmethod
    def _authenticate(request: Request) -> CurrentUser:
        authorization = request.headers.get("Authorization")
        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            return decode_access_token(token)
        except (jwt.PyJWTError, TypeError, ValueError):
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            ) from None
