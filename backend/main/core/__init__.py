"""
Core module
Содержит базовые компоненты приложения: config, exceptions, базовые типы.
"""
from .config import Config, get_config, DatabaseConfig, JWTConfig, AppConfig
from .exceptions import (
    AppException,
    DomainException,
    ApplicationException,
    InfrastructureException,
    EntityNotFoundError,
    EntityAlreadyExistsError,
    ValidationError,
    BusinessRuleViolationError,
    UnauthorizedError,
    ForbiddenError,
    InvalidCredentialsError,
    TokenExpiredError,
    InvalidTokenError,
    DatabaseError,
    ConnectionError,
    ExternalServiceError,
    map_exception_to_http_status,
)

__all__ = [
    # Config
    'Config',
    'get_config',
    'DatabaseConfig',
    'JWTConfig',
    'AppConfig',
    
    # Exceptions
    'AppException',
    'DomainException',
    'ApplicationException',
    'InfrastructureException',
    'EntityNotFoundError',
    'EntityAlreadyExistsError',
    'ValidationError',
    'BusinessRuleViolationError',
    'UnauthorizedError',
    'ForbiddenError',
    'InvalidCredentialsError',
    'TokenExpiredError',
    'InvalidTokenError',
    'DatabaseError',
    'ConnectionError',
    'ExternalServiceError',
    'map_exception_to_http_status',
]
