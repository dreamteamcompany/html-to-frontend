"""
API Routes
Тонкие контроллеры для обработки HTTP запросов.
"""
from .auth_routes import AuthRoutes
from .user_routes import UserRoutes

__all__ = [
    'AuthRoutes',
    'UserRoutes',
]
