from enum import Enum


class TaskStatusTypes(str, Enum):
    NEW = "new"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
