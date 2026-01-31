"""
User Routes
Тонкие контроллеры для управления пользователями.
"""
from typing import Dict, Any
import json

from application import UserCreateRequest, UserResponse
from core import EntityNotFoundError, map_exception_to_http_status
from ..dependencies import Dependencies
from ..middleware import AuthMiddleware


class UserRoutes:
    """
    Роуты пользователей.
    Каждая функция — тонкий контроллер без бизнес-логики.
    """
    
    def __init__(self, deps: Dependencies):
        self._deps = deps
        self._auth_middleware = AuthMiddleware(deps)
    
    def get_me(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        GET /me
        Получить данные текущего пользователя с правами.
        """
        try:
            # Аутентификация
            user_with_perms = self._auth_middleware.authenticate(event)
            
            # Формирование ответа
            response_data = {
                'id': user_with_perms.user.id,
                'username': user_with_perms.user.username,
                'full_name': user_with_perms.user.full_name,
                'email': user_with_perms.user.email,
                'position': user_with_perms.user.position,
                'photo_url': user_with_perms.user.photo_url,
                'is_active': user_with_perms.user.is_active,
                'roles': [{'id': r.id, 'name': r.name} for r in user_with_perms.roles],
                'permissions': [p.full_permission for p in user_with_perms.permissions]
            }
            
            return self._success_response(200, response_data)
            
        except Exception as e:
            status = map_exception_to_http_status(e) if hasattr(e, '__class__') else 500
            return self._error_response(status, str(e))
    
    def get_approvers(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        GET /approvers
        Получить список всех активных пользователей (для выпадающих списков).
        Доступно всем авторизованным.
        """
        try:
            # Аутентификация (без проверки прав)
            self._auth_middleware.authenticate(event)
            
            # Вызов use case
            users = self._deps.user_management_use_case.get_all_active_users()
            
            # Упрощённый формат для dropdown
            response_data = [
                {
                    'id': user.id,
                    'full_name': user.full_name,
                    'position': user.position
                }
                for user in users
            ]
            
            return self._success_response(200, response_data)
            
        except Exception as e:
            status = map_exception_to_http_status(e) if hasattr(e, '__class__') else 500
            return self._error_response(status, str(e))
    
    @staticmethod
    def _success_response(status_code: int, data: Any) -> Dict[str, Any]:
        """Сформировать успешный ответ"""
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(data, default=str),  # default=str для datetime
            'isBase64Encoded': False
        }
    
    @staticmethod
    def _error_response(status_code: int, message: str) -> Dict[str, Any]:
        """Сформировать ответ с ошибкой"""
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': message}),
            'isBase64Encoded': False
        }
