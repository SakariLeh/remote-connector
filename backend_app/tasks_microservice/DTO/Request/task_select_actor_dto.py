from pydantic import BaseModel


class TaskSelectActorDTO(BaseModel):
    actor_id: int
