from pydantic import BaseModel

from backend_app.tasks_microservice.types import TaskStatusTypes


class TaskRequestDTO(BaseModel):
    id: int
    title: str | None = None
    description: str | None = None
    price: int | None = None
    status: TaskStatusTypes | None = None
    actor_id: int | None = None
