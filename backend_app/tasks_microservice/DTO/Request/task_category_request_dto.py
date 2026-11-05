from pydantic import BaseModel


class TaskCategoryRequestDTO(BaseModel):
    id: int
    name: str | None = None
    description: str | None = None
