from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from backend_app.identity_microservice.controllers import auth_router, profile_router
from backend_app.identity_microservice.db_context import engine
from backend_app.identity_microservice.entities import Base
from backend_app.shared.exception_handling import setup_exception_handling
from backend_app.shared.jwt_authentication import setup_jwt_authentication


# TODO: вынести в generic create_app() фабрику микросервиса (роутеры, lifespan, metadata)


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Identity Microservice",
    description=(
        "Authentication and identity management API. "
        "Protected routes: Authorize in Swagger with JWT from POST /auth/authorize."
    ),
    version="0.1.0",
    lifespan=_lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)


setup_exception_handling(app)
setup_jwt_authentication(
    app,
    public_paths=(
        "/auth/register",
        "/auth/authorize",
        "/docs",
        "/openapi.json",
        "/redoc",
    ),
)
app.include_router(auth_router)
app.include_router(profile_router)
# TODO: подключать роутеры generic-способом (автосбор / registry)


if __name__ == "__main__":
    uvicorn.run(
        "backend_app.identity_microservice.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )
