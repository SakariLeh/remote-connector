import datetime

from pydantic import BaseModel, ConfigDict


class TaskCategoryResponseDTO(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
