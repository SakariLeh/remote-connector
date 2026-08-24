from typing import Any

class AppException(Exception):
    status_code: int = 400
    error_code: str = "APPLICATION_ERROR"

    def __init__(self, message: str, *, details: Any|None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details


# Запрос составлен некорректно
class BadRequestException(AppException):
    status_code: int = 400
    error_code: str = "BAD_REQUEST"

# Необходима авторизация
class UnauthorizedException(AppException):
    status_code: int = 401
    error_code: str = "UNAUTHORIZED"

# Доступ запрещен
class ForbiddenException(AppException):
    status_code: int = 403
    error_code: str = "FORBIDDEN"

# Ресурс не найден/Сущность не найдена
class NotFoundException(AppException):
    status_code: int = 404
    error_code: str = "NOT_FOUND"

# Ресурс уже существует/Сущность уже существует. При создании сущности. При обновлении сущности. При удалении сущности.
class ConflictException(AppException):
    status_code: int = 409
    error_code: str = "CONFLICT"

# Сущность не может быть обработана. При ошибке валидации.
class UnprocessableEntityException(AppException):
    status_code: int = 422
    error_code: str = "UNPROCESSABLE_ENTITY"

# Слишком много запросов. При превышении лимита запросов. Когда установлен лимит на количество запросов одному клиенту
class TooManyRequestsException(AppException):
    status_code: int = 429
    error_code: str = "TOO_MANY_REQUESTS"

# Внутренняя ошибка сервера. При непредвиденной ошибке сервера. Когда сервер не может обработать запрос. Когда сервер не может получить доступ к ресурсу. Когда сервер не может сохранить данные. Когда сервер не может удалить данные.
class InternalServerErrorException(AppException):
    status_code: int = 500
    error_code: str = "INTERNAL_SERVER_ERROR"