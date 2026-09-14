from contextlib import asynccontextmanager
import asyncio

import uvicorn
from fastapi import FastAPI

from backend_app.shared.db_context import engine, import_all_models, run_migrations
from backend_app.shared.exception_handling import setup_exception_handling
from backend_app.shared.jwt_authentication import setup_jwt_authentication
from backend_app.tasks_microservice.controllers import tasks_router

import_all_models()


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    await asyncio.to_thread(run_migrations)
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
