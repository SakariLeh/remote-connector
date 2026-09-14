from collections.abc import Iterable, Iterator

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.routing import APIRoute

from backend_app.shared.jwt_authentication.middleware import JWTAuthenticationMiddleware

_BEARER_SCHEME = {
    "type": "http",
    "scheme": "bearer",
    "bearerFormat": "JWT",
}


def setup_jwt_authentication(
    app: FastAPI,
    public_paths: Iterable[str] = (),
) -> FastAPI:
    app.add_middleware(
        JWTAuthenticationMiddleware,
        public_paths=public_paths,
    )
    _install_openapi_security(app)
    return app


def _iter_api_routes(routes: Iterable) -> Iterator[APIRoute]:
    for route in routes:
        if isinstance(route, APIRoute):
            yield route
        nested_router = getattr(route, "original_router", None)
        if nested_router is not None:
            yield from _iter_api_routes(nested_router.routes)


def _install_openapi_security(app: FastAPI) -> None:
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema

        schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )
        components = schema.setdefault("components", {})
        security_schemes = components.setdefault("securitySchemes", {})
        security_schemes["BearerAuth"] = _BEARER_SCHEME

        paths = schema.get("paths", {})
        for route in _iter_api_routes(app.routes):
            if not getattr(route.endpoint, "requires_auth", False):
                continue
            path_item = paths.get(route.path)
            if not path_item:
                continue
            for method in route.methods or ():
                operation = path_item.get(method.lower())
                if isinstance(operation, dict):
                    operation["security"] = [{"BearerAuth": []}]

        app.openapi_schema = schema
        return app.openapi_schema

    app.openapi = custom_openapi
