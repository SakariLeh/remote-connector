from pydantic import BaseModel, ConfigDict


class TaskAssignmentResponseDTO(BaseModel):
    id: int
    actor_id: int
    actor_name: str = ""
    task_id: int
    actor_status: int
    rating: int | None = None
    model_config = ConfigDict(from_attributes=True)
