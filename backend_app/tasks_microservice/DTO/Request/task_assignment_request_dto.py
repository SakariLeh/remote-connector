from pydantic import BaseModel



class TaskAssignmentRequestDTO(BaseModel):
    id: int | None = None
    actor_id: int | None = None
    task_id: int | None = None
    actor_status: int | None = None

# actor_status - 2, actor_id - 3 | В результате получим список заданий, от которых отказался пользователь с id 3
# actor_status - 2, task_id - 1 | В результате получим список id пользователей, которые отказались от задания с id 1

# actor_id - 6 | Вытащит все задания, на которые когда-либо откликался пользователь с id 6, 
# вне зависимости от его желания выполнять задачу(-и)

# task_id - 1 | Вытащит всех пользователей, которые откликнулись на задание с id 1, вне зависимости от их желания выполнять задачу(-и)
