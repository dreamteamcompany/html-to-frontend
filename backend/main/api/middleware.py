"""
API Middleware
Middleware для аутентификации и авторизации.
"""
from typing import Optional, Dict, Any

from core import UnauthorizedError, ForbiddenError
from domain import UserWithPermissions
from .dependencies import Dependencies


class AuthMiddleware:
    """
    Middleware для проверки аутентификации.
    Извлекает токен из headers, валидирует его, загружает пользователя.
    """
    
    def __init__(self, deps: Dependencies):
        self._deps = deps
    
    def authenticate(self, event: Dict[str, Any]) -> UserWithPermissions:
        """
        Проверить аутентификацию и вернуть пользователя с правами.
        
        Args:
            event: Cloud Function event с headers
        
        Returns:
            UserWithPermissions - аутентифицированный пользователь
        
        Raises:
            UnauthorizedError: если токен отсутствует или невалиден
        """
        # Извлечь токен из headers
        token = self._extract_token(event)
        
        if not token:
            raise UnauthorizedError("Authorization token is required")
        
        # Верифицировать токен и получить user_id
        try:
            user_id = self._deps.jwt_service.verify_token(token, token_type='access')['user_id']
        except Exception:
            raise UnauthorizedError("Invalid or expired token")
        
        # Загрузить пользователя с правами
        user_with_perms = self._deps.user_repository.get_with_permissions(user_id)
        
        if not user_with_perms or not user_with_perms.user.is_active:
            raise UnauthorizedError("User not found or inactive")
        
        return user_with_perms
    
    def require_permission(
        self,
        user: UserWithPermissions,
        resource: str,
        action: str
    ) -> None:
        """
        Проверить наличие конкретного разрешения.
        
        Args:
            user: Аутентифицированный пользователь
            resource: Ресурс (например, 'users')
            action: Действие (например, 'create')
        
        Raises:
            ForbiddenError: если прав недостаточно
        """
        if not user.has_permission(resource, action):
            raise ForbiddenError(
                f"Permission {resource}.{action} required",
                required_permission=f"{resource}.{action}"
            )
    
    @staticmethod
    def _extract_token(event: Dict[str, Any]) -> Optional[str]:
        """
        Извлечь токен из headers.
        Поддерживает X-Auth-Token header (специфика платформы).
        """
        headers = event.get('headers', {})
        
        # X-Auth-Token (основной способ для платформы)
        token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
        
        if token:
            return token
        
        # Fallback: Authorization: Bearer <token>
        auth_header = headers.get('Authorization') or headers.get('authorization')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header[7:]  # убрать "Bearer "
        
        return None
