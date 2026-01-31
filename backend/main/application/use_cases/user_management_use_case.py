"""
User Management Use Case
Бизнес-логика управления пользователями: создание, обновление, удаление.
"""
from datetime import datetime
from typing import Optional

from domain import IUserRepository, User
from infrastructure import PasswordHasher
from core import EntityNotFoundError, ForbiddenError
from ..dto import UserCreateRequest, UserUpdateRequest, UserResponse


class UserManagementUseCase:
    """
    Use Case для управления пользователями.
    Функции длиной до 40 строк, одна ответственность.
    """
    
    def __init__(
        self,
        user_repository: IUserRepository,
        password_hasher: PasswordHasher
    ):
        self._user_repo = user_repository
        self._password_hasher = password_hasher
    
    def create_user(self, request: UserCreateRequest, created_by_id: int) -> UserResponse:
        """
        Создать нового пользователя.
        
        Бизнес-правила:
        1. Username должен быть уникальным
        2. Пароль хешируется
        3. Пользователь создаётся активным
        """
        # Хешировать пароль
        password_hash = self._password_hasher.hash_password(request.password)
        
        # Создать domain entity
        user = User(
            id=0,  # будет назначен БД
            username=request.username,
            full_name=request.full_name,
            email=request.email,
            password_hash=password_hash,
            position=request.position,
            photo_url=request.photo_url,
            is_active=True,
            created_at=datetime.utcnow(),
            last_login=None
        )
        
        # Сохранить в БД
        created_user = self._user_repo.create(user)
        
        return self._map_to_response(created_user)
    
    def get_user_by_id(self, user_id: int) -> UserResponse:
        """Получить пользователя по ID"""
        user = self._user_repo.get_by_id(user_id)
        
        if not user:
            raise EntityNotFoundError('User', user_id)
        
        return self._map_to_response(user)
    
    def update_user(
        self,
        user_id: int,
        request: UserUpdateRequest,
        updated_by_id: int
    ) -> UserResponse:
        """
        Обновить пользователя.
        
        Бизнес-правило: пользователь может редактировать только себя
        (если нет прав администратора, проверка в API слое).
        """
        user = self._user_repo.get_by_id(user_id)
        
        if not user:
            raise EntityNotFoundError('User', user_id)
        
        # Обновить данные профиля
        user.update_profile(
            full_name=request.full_name,
            email=request.email,
            position=request.position,
            photo_url=request.photo_url
        )
        
        # Обновить пароль если указан
        if request.password:
            password_hash = self._password_hasher.hash_password(request.password)
            user.change_password(password_hash)
        
        # Сохранить изменения
        updated_user = self._user_repo.update(user)
        
        return self._map_to_response(updated_user)
    
    def get_all_active_users(self) -> list[UserResponse]:
        """Получить всех активных пользователей (для выпадающих списков)"""
        users = self._user_repo.get_all_active()
        return [self._map_to_response(user) for user in users]
    
    @staticmethod
    def _map_to_response(user: User) -> UserResponse:
        """Преобразовать domain entity в DTO"""
        return UserResponse(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            position=user.position,
            photo_url=user.photo_url,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login=user.last_login
        )
