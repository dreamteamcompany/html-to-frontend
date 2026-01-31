"""
User Domain Entity
Чистая domain-сущность, НЕ зависит от Pydantic, FastAPI, БД.
Содержит бизнес-логику пользователя.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class User:
    """
    Сущность пользователя (Aggregate Root).
    Инвариант: активный пользователь должен иметь username и password_hash.
    """
    id: int
    username: str
    full_name: str
    email: Optional[str]
    password_hash: str
    position: Optional[str]
    photo_url: Optional[str]
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]
    
    def __post_init__(self):
        """Валидация инвариантов при создании"""
        if self.is_active:
            if not self.username or not self.password_hash:
                raise ValueError("Active user must have username and password_hash")
    
    def activate(self) -> None:
        """Активировать пользователя"""
        if not self.username or not self.password_hash:
            raise ValueError("Cannot activate user without credentials")
        self.is_active = True
    
    def deactivate(self) -> None:
        """Деактивировать пользователя"""
        self.is_active = False
    
    def update_last_login(self, login_time: datetime) -> None:
        """Обновить время последнего входа"""
        self.last_login = login_time
    
    def update_profile(
        self,
        full_name: Optional[str] = None,
        email: Optional[str] = None,
        position: Optional[str] = None,
        photo_url: Optional[str] = None
    ) -> None:
        """Обновить профиль пользователя"""
        if full_name is not None:
            if not full_name.strip():
                raise ValueError("Full name cannot be empty")
            self.full_name = full_name
        
        if email is not None:
            self.email = email
        
        if position is not None:
            self.position = position
        
        if photo_url is not None:
            self.photo_url = photo_url
    
    def change_password(self, new_password_hash: str) -> None:
        """Сменить пароль (принимает уже захешированный пароль)"""
        if not new_password_hash:
            raise ValueError("Password hash cannot be empty")
        self.password_hash = new_password_hash


@dataclass
class Role:
    """Роль пользователя"""
    id: int
    name: str
    description: Optional[str]
    
    def __post_init__(self):
        if not self.name.strip():
            raise ValueError("Role name cannot be empty")


@dataclass
class Permission:
    """Разрешение (право доступа)"""
    id: int
    name: str
    resource: str
    action: str
    description: Optional[str]
    
    def __post_init__(self):
        if not self.name.strip() or not self.resource.strip() or not self.action.strip():
            raise ValueError("Permission name, resource and action are required")
    
    @property
    def full_permission(self) -> str:
        """Полное имя разрешения в формате resource.action"""
        return f"{self.resource}.{self.action}"


@dataclass
class UserWithPermissions:
    """
    Value Object: пользователь с загруженными ролями и разрешениями.
    Используется для проверки прав доступа.
    """
    user: User
    roles: list[Role]
    permissions: list[Permission]
    
    def has_permission(self, resource: str, action: str) -> bool:
        """Проверить наличие конкретного разрешения"""
        required = f"{resource}.{action}"
        return any(p.full_permission == required for p in self.permissions)
    
    def has_any_permission(self, *permissions: str) -> bool:
        """Проверить наличие хотя бы одного из указанных разрешений"""
        user_permissions = {p.full_permission for p in self.permissions}
        return any(perm in user_permissions for perm in permissions)
    
    def has_all_permissions(self, *permissions: str) -> bool:
        """Проверить наличие всех указанных разрешений"""
        user_permissions = {p.full_permission for p in self.permissions}
        return all(perm in user_permissions for perm in permissions)
