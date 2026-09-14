class TaskRequestDTO:
    publisherId: int
    actorId: int | None
    title: str
    description: str
    price: int