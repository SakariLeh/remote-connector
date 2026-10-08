from pydantic import BaseModel


class TaskCreateDTO(BaseModel):
    title: str
    description: str
    price: int
