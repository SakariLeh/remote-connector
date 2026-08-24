from typing import Any
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    success: bool = False
    error: dict[str, Any]