"""
Cloud Function Handler (Entry Point)
Новый чистый handler с Clean Architecture.
Заменяет монолитный index.py (1639 строк → ~40 строк).
"""
from typing import Dict, Any
import sys

from api import Router
from core import AppException, map_exception_to_http_status
from infrastructure import close_db_connection


def log(msg: str) -> None:
    """Логирование в stderr (для Cloud Functions)"""
    print(msg, file=sys.stderr, flush=True)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Главная функция-обработчик Cloud Function.
    
    Архитектура:
    - Core: config, exceptions
    - Domain: entities, repository interfaces
    - Infrastructure: DB, security implementations
    - Application: use cases, DTOs
    - API: routes, middleware, router
    
    Handler делегирует всю работу Router, сам только ловит исключения.
    """
    log(f"Handler invoked: {event.get('httpMethod')} {event.get('queryStringParameters', {}).get('endpoint')}")
    
    try:
        # Создать роутер и обработать запрос
        router = Router()
        response = router.route(event)
        
        log(f"Response status: {response['statusCode']}")
        return response
        
    except AppException as e:
        # Доменные/приложенческие исключения
        status = map_exception_to_http_status(e)
        log(f"Application error: {e.message}")
        
        return {
            'statusCode': status,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': f'{{"error": "{e.message}"}}',
            'isBase64Encoded': False
        }
        
    except Exception as e:
        # Непредвиденные ошибки
        import traceback
        error_details = traceback.format_exc()
        log(f"Unexpected error: {str(e)}")
        log(f"Traceback: {error_details}")
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': '{"error": "Internal server error"}',
            'isBase64Encoded': False
        }
        
    finally:
        # Cleanup ресурсов
        close_db_connection()
