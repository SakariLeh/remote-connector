from pydantic import BaseModel

from backend_app.tasks_microservice.DTO.Response.task_assignment_response_dto import TaskAssignmentResponseDTO
from backend_app.tasks_microservice.DTO.Response.task_response_dto import TaskResponseDTO


class TaskPublisherViewDTO(BaseModel):
    tasks: list[TaskResponseDTO]
    assignments: list[TaskAssignmentResponseDTO]
