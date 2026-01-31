"""
API Routes
Тонкие контроллеры для обработки HTTP запросов.
"""
from .auth_routes import AuthRoutes
from .user_routes import UserRoutes
from .legacy_routes import LegacyRoutes

__all__ = [
    'AuthRoutes',
    'UserRoutes',
    'LegacyRoutes',
]