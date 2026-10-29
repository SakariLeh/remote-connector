from pydantic import BaseModel


class TaskCategoryCreateDTO(BaseModel):
    name: str
    description: str
