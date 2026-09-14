def import_all_models() -> None:
    """Register all ORM entities on the shared Base.metadata."""
    from backend_app.identity_microservice.entities.user_entity import UserEntity  # noqa: F401
    from backend_app.tasks_microservice.entities.task_entity import TaskEntity  # noqa: F401
