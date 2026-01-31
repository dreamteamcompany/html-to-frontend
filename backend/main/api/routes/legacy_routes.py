"""
Legacy Routes
Обертка для старых эндпоинтов из index.py.
Временное решение до полной миграции на Clean Architecture.
"""
from typing import Dict, Any
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Импорт всех handlers из старого index.py
import sys
import json


class LegacyRoutes:
    """
    Обертка для старых обработчиков.
    Делегирует запросы в функции из index.py.
    """
    
    def __init__(self):
        self._schema = 't_p61788166_html_to_frontend'
    
    def _get_connection(self):
        """Получить соединение с БД"""
        dsn = os.environ.get('DATABASE_URL')
        return psycopg2.connect(dsn)
    
    def route_legacy(self, endpoint: str, method: str, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Роутинг старых эндпоинтов.
        Импортирует функции из index.py и вызывает их.
        """
        conn = self._get_connection()
        
        try:
            # Импорт handlers из index.py
            from index import (
                handle_payments, handle_categories, handle_stats,
                handle_legal_entities, handle_contractors, handle_customer_departments,
                handle_roles, handle_permissions, handle_approvals,
                handle_services, handle_savings, handle_saving_reasons,
                handle_custom_fields, handle_users
            )
            
            # Роутинг
            if endpoint == 'payments':
                return handle_payments(method, event, conn)
            elif endpoint == 'categories':
                return handle_categories(method, event, conn)
            elif endpoint == 'stats':
                return handle_stats(event, conn)
            elif endpoint == 'legal-entities':
                return handle_legal_entities(method, event, conn)
            elif endpoint == 'contractors':
                return handle_contractors(method, event, conn)
            elif endpoint == 'customer_departments':
                return handle_customer_departments(method, event, conn)
            elif endpoint == 'roles':
                return handle_roles(method, event, conn)
            elif endpoint == 'permissions':
                return handle_permissions(method, event, conn)
            elif endpoint == 'approvals':
                return handle_approvals(method, event, conn)
            elif endpoint == 'services':
                return handle_services(method, event, conn)
            elif endpoint == 'savings':
                return handle_savings(method, event, conn)
            elif endpoint == 'saving-reasons':
                return handle_saving_reasons(method, event, conn)
            elif endpoint == 'custom-fields':
                return handle_custom_fields(method, event, conn)
            elif endpoint == 'users':
                return handle_users(method, event, conn)
            else:
                return self._error_response(404, f"Endpoint '{endpoint}' not found in legacy routes")
        
        finally:
            conn.close()
    
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
