from pydantic import BaseModel, ConfigDict


class TaskAssignmentResponseDTO(BaseModel):
    id: int
    actor_id: int
    task_id: int
    actor_status: int
    model_config = ConfigDict(from_attributes=True)
