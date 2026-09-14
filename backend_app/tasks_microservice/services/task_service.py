from argon2 import PasswordHasher

from backend_app.identity_microservice.DTO import UserRequestDTO, UserResponseDTO
from backend_app.identity_microservice.repositories import UserRepository

from backend_app.shared.jwt_authentication import CurrentUser, get_current_user
from backend_app.tasks_microservice.DTO.Request.task_request_dto import TaskRequestDTO
from backend_app.tasks_microservice.DTO.Response.task_response_dto import TaskResponseDTO
from backend_app.tasks_microservice.repositories.task_repository import TaskRepository

class TaskService:
    def __init__(self, task_repository: TaskRepository):
        self.task_repo = task_repository

    async def create_task(self, task: TaskRequestDTO) -> TaskResponseDTO:
        return await self.task_repo.create_task(task)

    async def get_task_by_id(self, task_id: int) -> TaskResponseDTO | None:
        return await self.task_repo.get_task_by_id(task_id)

    async def get_all_tasks(self) -> list[TaskResponseDTO]:
        return list (await self.task_repo.get_all_tasks())