"""
Authentication Use Case
Бизнес-логика аутентификации: login, token refresh.
"""
from datetime import datetime

from domain import IUserRepository
from infrastructure import PasswordHasher, JWTService
from core import InvalidCredentialsError, EntityNotFoundError
from ..dto import LoginRequest, LoginResponse


class AuthUseCase:
    """
    Use Case для аутентификации.
    Оркестрирует проверку учётных данных и генерацию токенов.
    """
    
    def __init__(
        self,
        user_repository: IUserRepository,
        password_hasher: PasswordHasher,
        jwt_service: JWTService
    ):
        self._user_repo = user_repository
        self._password_hasher = password_hasher
        self._jwt_service = jwt_service
    
    def login(self, request: LoginRequest) -> LoginResponse:
        """
        Аутентифицировать пользователя.
        
        Бизнес-правила:
        1. Пользователь должен существовать
        2. Пользователь должен быть активным
        3. Пароль должен совпадать
        4. Обновить last_login
        
        Returns:
            LoginResponse с токенами
        
        Raises:
            InvalidCredentialsError: если логин/пароль неверные
        """
        # Найти пользователя
        user = self._user_repo.get_by_username(request.username)
        
        if not user:
            raise InvalidCredentialsError()
        
        # Проверить активность
        if not user.is_active:
            raise InvalidCredentialsError()
        
        # Проверить пароль
        if not self._password_hasher.verify_password(request.password, user.password_hash):
            raise InvalidCredentialsError()
        
        # Обновить last_login
        login_time = datetime.utcnow()
        self._user_repo.update_last_login(user.id, login_time)
        
        # Сгенерировать токены
        access_token = self._jwt_service.create_access_token(user.id)
        refresh_token = self._jwt_service.create_refresh_token(user.id)
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id,
            username=user.username,
            full_name=user.full_name
        )
    
    def refresh_token(self, refresh_token: str) -> str:
        """
        Обновить access токен используя refresh токен.
        
        Returns:
            Новый access токен
        
        Raises:
            InvalidTokenError, TokenExpiredError
        """
        return self._jwt_service.refresh_access_token(refresh_token)
    
    def verify_access_token(self, access_token: str) -> int:
        """
        Проверить access токен и получить user_id.
        
        Returns:
            user_id из токена
        
        Raises:
            InvalidTokenError, TokenExpiredError
        """
        payload = self._jwt_service.verify_token(access_token, token_type='access')
        return payload['user_id']
