"""
Core Exceptions
Базовые исключения для всех слоёв приложения.
Следуют принципу: domain exceptions -> application exceptions -> infrastructure exceptions.
"""
from typing import Optional, Any


# ============================================================================
# BASE EXCEPTIONS
# ============================================================================

class AppException(Exception):
    """
    Базовое исключение приложения.
    Все кастомные исключения наследуются от него.
    """
    def __init__(self, message: str, details: Optional[dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


# ============================================================================
# DOMAIN EXCEPTIONS (бизнес-логика)
# ============================================================================

class DomainException(AppException):
    """Базовое исключение для domain-слоя"""
    pass


class EntityNotFoundError(DomainException):
    """Сущность не найдена"""
    def __init__(self, entity_type: str, entity_id: Any):
        super().__init__(
            f"{entity_type} with id={entity_id} not found",
            {"entity_type": entity_type, "entity_id": entity_id}
        )


class EntityAlreadyExistsError(DomainException):
    """Сущность уже существует"""
    def __init__(self, entity_type: str, field: str, value: Any):
        super().__init__(
            f"{entity_type} with {field}={value} already exists",
            {"entity_type": entity_type, "field": field, "value": value}
        )


class ValidationError(DomainException):
    """Ошибка валидации данных"""
    def __init__(self, field: str, message: str):
        super().__init__(
            f"Validation error in field '{field}': {message}",
            {"field": field}
        )


class BusinessRuleViolationError(DomainException):
    """Нарушение бизнес-правила"""
    pass


# ============================================================================
# APPLICATION EXCEPTIONS (use cases, services)
# ============================================================================

class ApplicationException(AppException):
    """Базовое исключение для application-слоя"""
    pass


class UnauthorizedError(ApplicationException):
    """Пользователь не авторизован"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message)


class ForbiddenError(ApplicationException):
    """Недостаточно прав доступа"""
    def __init__(self, message: str = "Forbidden", required_permission: Optional[str] = None):
        details = {"required_permission": required_permission} if required_permission else {}
        super().__init__(message, details)


class InvalidCredentialsError(ApplicationException):
    """Неверные учётные данные"""
    def __init__(self):
        super().__init__("Invalid username or password")


class TokenExpiredError(ApplicationException):
    """Токен истёк"""
    def __init__(self):
        super().__init__("Token has expired")


class InvalidTokenError(ApplicationException):
    """Невалидный токен"""
    def __init__(self):
        super().__init__("Invalid token")


# ============================================================================
# INFRASTRUCTURE EXCEPTIONS (DB, external services)
# ============================================================================

class InfrastructureException(AppException):
    """Базовое исключение для infrastructure-слоя"""
    pass


class DatabaseError(InfrastructureException):
    """Ошибка работы с БД"""
    pass


class ConnectionError(InfrastructureException):
    """Ошибка подключения к внешнему сервису"""
    pass


class ExternalServiceError(InfrastructureException):
    """Ошибка внешнего сервиса"""
    pass


# ============================================================================
# HELPERS
# ============================================================================

def map_exception_to_http_status(exc: AppException) -> int:
    """
    Маппинг исключений на HTTP статус-коды.
    Используется в API-слое для формирования ответов.
    """
    mapping = {
        # Domain
        EntityNotFoundError: 404,
        EntityAlreadyExistsError: 409,
        ValidationError: 400,
        BusinessRuleViolationError: 422,
        
        # Application
        UnauthorizedError: 401,
        ForbiddenError: 403,
        InvalidCredentialsError: 401,
        TokenExpiredError: 401,
        InvalidTokenError: 401,
        
        # Infrastructure
        DatabaseError: 500,
        ConnectionError: 503,
        ExternalServiceError: 502,
    }
    
    return mapping.get(type(exc), 500)
