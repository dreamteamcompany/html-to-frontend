"""
User DTOs (Data Transfer Objects)
Pydantic модели для валидации входных/выходных данных API.
НЕ являются domain entities.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    """DTO для запроса логина"""
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=4)


class LoginResponse(BaseModel):
    """DTO для ответа логина"""
    access_token: str
    refresh_token: str
    user_id: int
    username: str
    full_name: str


class UserCreateRequest(BaseModel):
    """DTO для создания пользователя"""
    username: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: Optional[str] = None
    password: str = Field(..., min_length=4)
    position: Optional[str] = None
    photo_url: Optional[str] = None


class UserUpdateRequest(BaseModel):
    """DTO для обновления пользователя"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    password: Optional[str] = Field(None, min_length=4)


class UserResponse(BaseModel):
    """DTO для ответа с данными пользователя"""
    id: int
    username: str
    full_name: str
    email: Optional[str]
    position: Optional[str]
    photo_url: Optional[str]
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]


class UserWithPermissionsResponse(UserResponse):
    """DTO для ответа с пользователем и его правами"""
    roles: list[dict]
    permissions: list[str]  # список в формате "resource.action"
