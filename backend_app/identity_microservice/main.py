from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from backend_app.identity_microservice.controllers import auth_router, profile_router
from backend_app.identity_microservice.db_context import engine
from backend_app.identity_microservice.entities import Base

__all__ = ["app"]


# TODO


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

app.include_router(auth_router)
app.include_router(profile_router)
# TODO


if __name__ == "__main__":
    uvicorn.run(
        "backend_app.identity_microservice.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )
