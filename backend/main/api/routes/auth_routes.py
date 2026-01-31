"""
Auth Routes
Тонкие контроллеры для аутентификации. БЕЗ бизнес-логики.
"""
from typing import Dict, Any
import json

from application import LoginRequest, LoginResponse
from core import InvalidCredentialsError, map_exception_to_http_status
from ..dependencies import Dependencies


class AuthRoutes:
    """
    Роуты аутентификации.
    Функции до 40 строк, только HTTP логика, без бизнес-правил.
    """
    
    def __init__(self, deps: Dependencies):
        self._deps = deps
    
    def login(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        POST /login
        Аутентификация пользователя.
        """
        try:
            # Парсинг body
            body = json.loads(event.get('body', '{}'))
            request = LoginRequest(**body)
            
            # Вызов use case
            response = self._deps.auth_use_case.login(request)
            
            # Формирование ответа
            return self._success_response(200, response.dict())
            
        except InvalidCredentialsError as e:
            return self._error_response(401, e.message)
        except Exception as e:
            return self._error_response(400, str(e))
    
    def refresh_token(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        POST /refresh
        Обновление access токена.
        """
        try:
            body = json.loads(event.get('body', '{}'))
            refresh_token = body.get('refresh_token')
            
            if not refresh_token:
                return self._error_response(400, "refresh_token is required")
            
            # Вызов use case
            new_access_token = self._deps.auth_use_case.refresh_token(refresh_token)
            
            return self._success_response(200, {'access_token': new_access_token})
            
        except Exception as e:
            return self._error_response(401, str(e))
    
    @staticmethod
    def _success_response(status_code: int, data: Any) -> Dict[str, Any]:
        """Сформировать успешный ответ"""
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(data),
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
