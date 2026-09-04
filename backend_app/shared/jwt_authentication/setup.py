from collections.abc import Iterable

from fastapi import FastAPI

from backend_app.shared.jwt_authentication.middleware import JWTAuthenticationMiddleware


def setup_jwt_authentication(
    app: FastAPI,
    public_paths: Iterable[str] = (),
) -> FastAPI:
    app.add_middleware(
        JWTAuthenticationMiddleware,
        public_paths=public_paths,
    )
    return app
