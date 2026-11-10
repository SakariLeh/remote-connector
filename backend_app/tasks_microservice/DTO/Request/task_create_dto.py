from pydantic import BaseModel


class TaskCreateDTO(BaseModel):
    title: str
    description: str
    price: int
    task_category_id: int
