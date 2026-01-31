"""
API Router
Маршрутизация запросов к соответствующим контроллерам.
"""
from typing import Dict, Any
import json

from .dependencies import get_dependencies
from .routes import AuthRoutes, UserRoutes


class Router:
    """
    Роутер для Cloud Functions.
    Маршрутизирует запросы по endpoint и method к нужным контроллерам.
    """
    
    def __init__(self):
        self._deps = get_dependencies()
        self._auth_routes = AuthRoutes(self._deps)
        self._user_routes = UserRoutes(self._deps)
    
    def route(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Основной метод роутинга.
        
        Args:
            event: Cloud Function event
        
        Returns:
            HTTP response dict
        """
        method = event.get('httpMethod', 'GET')
        endpoint = self._get_endpoint(event)
        
        # OPTIONS для CORS
        if method == 'OPTIONS':
            return self._cors_response()
        
        # Роутинг
        try:
            if endpoint == 'login' and method == 'POST':
                return self._auth_routes.login(event)
            
            elif endpoint == 'refresh' and method == 'POST':
                return self._auth_routes.refresh_token(event)
            
            elif endpoint == 'me' and method == 'GET':
                return self._user_routes.get_me(event)
            
            elif endpoint == 'approvers' and method == 'GET':
                return self._user_routes.get_approvers(event)
            
            elif endpoint == 'health':
                return self._success_response(200, {'status': 'healthy', 'version': '3.0.0'})
            
            else:
                return self._error_response(404, f"Endpoint '{endpoint}' not found")
        
        finally:
            self._deps.cleanup()
    
    @staticmethod
    def _get_endpoint(event: Dict[str, Any]) -> str:
        """Извлечь endpoint из query параметров"""
        params = event.get('queryStringParameters') or {}
        return params.get('endpoint', '')
    
    @staticmethod
    def _cors_response() -> Dict[str, Any]:
        """Ответ на OPTIONS запрос (CORS preflight)"""
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    @staticmethod
    def _success_response(status_code: int, data: Any) -> Dict[str, Any]:
        """Успешный ответ"""
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
        """Ответ с ошибкой"""
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': message}),
            'isBase64Encoded': False
        }
