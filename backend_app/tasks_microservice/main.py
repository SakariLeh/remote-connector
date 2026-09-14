from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from backend_app.shared.exception_handling import setup_exception_handling
from backend_app.shared.jwt_authentication import setup_jwt_authentication
from backend_app.tasks_microservice.controllers import tasks_router
from backend_app.tasks_microservice.db_context import engine
from backend_app.tasks_microservice.entities import Base


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Tasks Microservice",
    description=(
        "Tasks management API. "
        "Protected routes: Authorize in Swagger with JWT from Identity POST /auth/authorize."
    ),
    version="0.1.0",
    lifespan=_lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)


setup_exception_handling(app)
setup_jwt_authentication(
    app,
    public_paths=(
        "/docs",
        "/openapi.json",
        "/redoc",
    ),
)
app.include_router(tasks_router)


if __name__ == "__main__":
    uvicorn.run(
        "backend_app.tasks_microservice.main:app",
        host="127.0.0.1",
        port=8002,
        reload=True,
    )
