import datetime

from backend_app.tasks_microservice.types.task_status_types import TaskStatusTypes


class TaskResponseDTO:
    id: int
    publisherId: int
    actorId: int | None
    title: str
    description: str
    status: TaskStatusTypes
    price: int
    createdAt: datetime.datetime
    updatedAt: datetime.datetime