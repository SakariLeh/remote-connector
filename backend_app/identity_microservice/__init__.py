"""Identity microservice package.

Публичный API микросервиса — через подпакеты (controllers, services, ...).
Сам пакет намеренно не реэкспортирует слои, чтобы не тянуть циклы при импорте main.
"""

__all__: list[str] = []
