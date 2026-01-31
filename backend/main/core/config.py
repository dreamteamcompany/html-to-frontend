"""
Core Configuration
Центральное место для всех настроек приложения.
Использует переменные окружения, предоставляет типизированный доступ к конфигурации.
"""
import os
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class DatabaseConfig:
    """Конфигурация подключения к PostgreSQL"""
    dsn: str
    schema: str
    pool_size: int = 10
    
    @classmethod
    def from_env(cls) -> 'DatabaseConfig':
        """Создаёт конфиг из переменных окружения"""
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise ValueError("DATABASE_URL environment variable is required")
        
        return cls(
            dsn=dsn,
            schema='t_p61788166_html_to_frontend',
            pool_size=int(os.environ.get('DB_POOL_SIZE', '10'))
        )


@dataclass(frozen=True)
class JWTConfig:
    """Конфигурация JWT токенов"""
    secret_key: str
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    @classmethod
    def from_env(cls) -> 'JWTConfig':
        """Создаёт конфиг из переменных окружения"""
        secret = os.environ.get('JWT_SECRET_KEY')
        if not secret:
            raise ValueError("JWT_SECRET_KEY environment variable is required")
        
        return cls(
            secret_key=secret,
            algorithm=os.environ.get('JWT_ALGORITHM', 'HS256'),
            access_token_expire_minutes=int(os.environ.get('JWT_ACCESS_EXPIRE_MIN', '30')),
            refresh_token_expire_days=int(os.environ.get('JWT_REFRESH_EXPIRE_DAYS', '7'))
        )


@dataclass(frozen=True)
class AppConfig:
    """Общая конфигурация приложения"""
    version: str
    debug: bool
    cors_origins: list[str]
    
    @classmethod
    def from_env(cls) -> 'AppConfig':
        """Создаёт конфиг из переменных окружения"""
        origins_str = os.environ.get('CORS_ORIGINS', '*')
        origins = origins_str.split(',') if origins_str != '*' else ['*']
        
        return cls(
            version='3.0.0',
            debug=os.environ.get('DEBUG', 'false').lower() == 'true',
            cors_origins=origins
        )


class Config:
    """
    Главный класс конфигурации приложения.
    Инициализируется один раз при старте приложения.
    Immutable после создания.
    """
    
    def __init__(self):
        self._db = DatabaseConfig.from_env()
        self._jwt = JWTConfig.from_env()
        self._app = AppConfig.from_env()
    
    @property
    def db(self) -> DatabaseConfig:
        return self._db
    
    @property
    def jwt(self) -> JWTConfig:
        return self._jwt
    
    @property
    def app(self) -> AppConfig:
        return self._app


# Singleton instance (инициализируется лениво)
_config: Optional[Config] = None


def get_config() -> Config:
    """
    Получить глобальный конфиг приложения.
    Создаётся один раз при первом вызове.
    """
    global _config
    if _config is None:
        _config = Config()
    return _config
