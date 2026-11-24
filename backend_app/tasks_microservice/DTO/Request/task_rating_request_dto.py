from pydantic import BaseModel, Field


class TaskRatingRequestDTO(BaseModel):
    rating: int = Field(ge=1, le=5)
