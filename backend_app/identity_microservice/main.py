from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from backend_app.identity_microservice.controllers.auth_controller import auth_router
from backend_app.identity_microservice.db_context.database import engine
from backend_app.identity_microservice.entities.user_entity import Base

# TODO: вынести в generic create_app() фабрику микросервиса (роутеры, lifespan, metadata)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Identity Microservice",
    description="Authentication and identity management API",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(auth_router)
# TODO: подключать роутеры generic-способом (автосбор / registry)


if __name__ == "__main__":
    uvicorn.run(
        "backend_app.identity_microservice.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )
