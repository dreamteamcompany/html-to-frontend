import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Очистка всех данных проекта: удаляет содержимое всех таблиц, 
    кроме системных (users, roles, permissions).
    """
    method: str = event.get('httpMethod', 'POST')
    
    # CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only POST allowed'}),
            'isBase64Encoded': False
        }
    
    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw)
    except Exception:
        body = {}
    
    mode = body.get('mode', 'all')
    SCHEMA = 't_p61788166_html_to_frontend'
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        cleared = []
        
        with conn.cursor() as cur:
            if mode == 'payments_only':
                # Удаляем только платежи и связанные записи, справочники не трогаем
                payment_tables = [
                    'payment_comments',
                    'comment_likes',
                    'approvals',
                    'custom_field_values',
                    'savings',
                    'payments',
                ]
                for table in payment_tables:
                    try:
                        cur.execute(f"DELETE FROM {SCHEMA}.{table}")
                        cleared.append(table)
                    except Exception as e:
                        print(f"Skip {table}: {e}")
            else:
                # Полная очистка всех таблиц кроме системных
                tables_to_clear = [
                    'payments',
                    'approvals',
                    'audit_logs',
                    'savings',
                    'legal_entities',
                    'categories',
                    'custom_fields',
                    'custom_field_values',
                    'payment_custom_field_values',
                    'payment_custom_values',
                    'contractors',
                    'customer_departments',
                    'services',
                    'saving_reasons',
                    'payment_comments',
                    'comment_likes',
                    'log_files',
                    'log_entries',
                    'log_statistics',
                    'dashboard_layouts',
                ]
                for table in tables_to_clear:
                    try:
                        cur.execute(f"TRUNCATE TABLE {SCHEMA}.{table} RESTART IDENTITY CASCADE")
                        cleared.append(table)
                    except Exception as e:
                        print(f"Skip {table}: {e}")
            
            conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'tables_cleared': len(cleared),
                'cleared_tables': cleared,
                'message': 'Все данные успешно удалены'
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()