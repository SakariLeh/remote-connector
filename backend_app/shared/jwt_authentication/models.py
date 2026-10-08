from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class CurrentUser:
    user_id: int
    email: str
    role: str
