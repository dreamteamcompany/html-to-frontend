"""
API Dependencies
Dependency Injection для API слоя.
Создаёт инстансы repositories, use cases для обработки запросов.
"""
from infrastructure import (
    get_db_connection,
    UserRepositoryImpl,
    PaymentRepositoryImpl,
    PasswordHasher,
    JWTService
)
from application import AuthUseCase, UserManagementUseCase


class Dependencies:
    """
    Контейнер зависимостей.
    Создаёт и кэширует инстансы сервисов для обработки одного запроса.
    """
    
    def __init__(self):
        # Infrastructure
        self._db = get_db_connection()
        self._password_hasher = PasswordHasher()
        self._jwt_service = JWTService()
        
        # Repositories
        self._user_repo = UserRepositoryImpl(self._db)
        self._payment_repo = PaymentRepositoryImpl(self._db)
        
        # Use Cases
        self._auth_use_case = None
        self._user_management_use_case = None
    
    @property
    def auth_use_case(self) -> AuthUseCase:
        """Получить AuthUseCase"""
        if self._auth_use_case is None:
            self._auth_use_case = AuthUseCase(
                self._user_repo,
                self._password_hasher,
                self._jwt_service
            )
        return self._auth_use_case
    
    @property
    def user_management_use_case(self) -> UserManagementUseCase:
        """Получить UserManagementUseCase"""
        if self._user_management_use_case is None:
            self._user_management_use_case = UserManagementUseCase(
                self._user_repo,
                self._password_hasher
            )
        return self._user_management_use_case
    
    @property
    def jwt_service(self) -> JWTService:
        """Получить JWTService (для middleware)"""
        return self._jwt_service
    
    @property
    def user_repository(self) -> UserRepositoryImpl:
        """Получить UserRepository (для middleware)"""
        return self._user_repo
    
    def cleanup(self):
        """Очистка ресурсов после обработки запроса"""
        # БД подключение закрывается автоматически при завершении handler
        pass


def get_dependencies() -> Dependencies:
    """
    Factory для создания Dependencies.
    Вызывается для каждого запроса.
    """
    return Dependencies()
