import datetime

from pydantic import BaseModel, ConfigDict

from backend_app.tasks_microservice.types import TaskStatusTypes


class TaskResponseDTO(BaseModel):
    id: int
    publisher_id: int
    actor_id: int | None
    title: str
    description: str
    status: TaskStatusTypes
    price: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
