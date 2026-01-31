"""
User Repository Interface
Интерфейс для работы с пользователями.
Domain слой определяет ЧТО нужно, infrastructure слой определяет КАК.
"""
from abc import ABC, abstractmethod
from typing import Optional
from datetime import datetime

from ..entities import User, UserWithPermissions


class IUserRepository(ABC):
    """
    Интерфейс репозитория пользователей.
    Определяет контракт для работы с пользователями, не зная о реализации (SQL, NoSQL, etc).
    """
    
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Получить пользователя по ID"""
        pass
    
    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        """Получить пользователя по username"""
        pass
    
    @abstractmethod
    def get_with_permissions(self, user_id: int) -> Optional[UserWithPermissions]:
        """Получить пользователя с ролями и разрешениями"""
        pass
    
    @abstractmethod
    def get_all_active(self) -> list[User]:
        """Получить всех активных пользователей"""
        pass
    
    @abstractmethod
    def create(self, user: User) -> User:
        """
        Создать нового пользователя.
        Возвращает созданного пользователя с заполненным ID.
        """
        pass
    
    @abstractmethod
    def update(self, user: User) -> User:
        """Обновить существующего пользователя"""
        pass
    
    @abstractmethod
    def delete(self, user_id: int) -> bool:
        """
        Удалить пользователя.
        Возвращает True если удалён, False если не найден.
        """
        pass
    
    @abstractmethod
    def exists_by_username(self, username: str) -> bool:
        """Проверить существование пользователя с данным username"""
        pass
    
    @abstractmethod
    def update_last_login(self, user_id: int, login_time: datetime) -> None:
        """Обновить время последнего входа"""
        pass
