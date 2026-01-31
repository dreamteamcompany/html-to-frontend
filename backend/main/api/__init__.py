"""
API Layer
HTTP обработка, роутинг, middleware. БЕЗ бизнес-логики.
"""
from .router import Router
from .dependencies import get_dependencies
from .middleware import AuthMiddleware

__all__ = [
    'Router',
    'get_dependencies',
    'AuthMiddleware',
]
