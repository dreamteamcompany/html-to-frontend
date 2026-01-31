"""
DTOs (Data Transfer Objects)
Pydantic модели для API слоя. Отдельны от domain entities.
"""
from .user_dto import (
    LoginRequest,
    LoginResponse,
    UserCreateRequest,
    UserUpdateRequest,
    UserResponse,
    UserWithPermissionsResponse,
)

__all__ = [
    'LoginRequest',
    'LoginResponse',
    'UserCreateRequest',
    'UserUpdateRequest',
    'UserResponse',
    'UserWithPermissionsResponse',
]
