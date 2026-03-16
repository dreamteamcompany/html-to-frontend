import json
import os
import jwt
from typing import Dict, Any, Optional
import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p61788166_html_to_frontend'

ALLOWED_TABLES = {
    'payment_custom_field_values',
    'payment_custom_values',
    'planned_payment_custom_field_values',
    'planned_payments',
    'comment_attachments',
    'comment_likes',
    'comment_reactions',
    'payment_comments',
    'payment_documents',
    'payment_views',
    'custom_field_values',
    'approvals',
    'notifications',
    'audit_logs',
    'payments',
    'savings',
    'saving_reasons',
    'legal_entities',
    'categories',
    'custom_fields',
    'contractors',
    'customer_departments',
    'services',
    'log_files',
    'log_entries',
    'log_statistics',
    'dashboard_layouts',
}

def verify_token(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    headers = event.get('headers', {})
    token = (headers.get('X-Auth-Token') or
             headers.get('x-auth-token') or
             headers.get('X-Authorization') or
             headers.get('x-authorization', ''))
    if token:
        token = token.replace('Bearer ', '').strip()
    if not token:
        return None
    try:
        secret = os.environ.get('JWT_SECRET')
        if not secret:
            return None
        return jwt.decode(token, secret, algorithms=['HS256'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def is_admin(conn, user_id: int) -> bool:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(f"""
            SELECT COUNT(*) as cnt FROM {SCHEMA}.roles r
            JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = %s AND r.name IN ('Администратор', 'Admin')
        """, (user_id,))
        row = cur.fetchone()
        return row['cnt'] > 0 if row else False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Очистка данных проекта. Только для администраторов.
    POST /          — удаляет только платежи и историю (справочники не трогает)
    POST /?mode=all — удаляет всё включая справочники
    """
    method: str = event.get('httpMethod', 'POST')

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

    payload = verify_token(event)
    if not payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }

    params = event.get('queryStringParameters') or {}
    mode = params.get('mode', 'payments')

    if mode == 'all':
        tables_to_clear = [
            'payment_custom_field_values',
            'payment_custom_values',
            'planned_payment_custom_field_values',
            'planned_payments',
            'comment_attachments',
            'comment_likes',
            'comment_reactions',
            'payment_comments',
            'payment_documents',
            'payment_views',
            'custom_field_values',
            'approvals',
            'notifications',
            'audit_logs',
            'payments',
            'savings',
            'saving_reasons',
            'legal_entities',
            'categories',
            'custom_fields',
            'contractors',
            'customer_departments',
            'services',
            'log_files',
            'log_entries',
            'log_statistics',
            'dashboard_layouts',
        ]
    else:
        tables_to_clear = [
            'payment_custom_field_values',
            'payment_custom_values',
            'planned_payment_custom_field_values',
            'planned_payments',
            'comment_attachments',
            'comment_likes',
            'comment_reactions',
            'payment_comments',
            'payment_documents',
            'payment_views',
            'custom_field_values',
            'approvals',
            'notifications',
            'audit_logs',
            'payments',
        ]

    for table in tables_to_clear:
        if table not in ALLOWED_TABLES:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Недопустимая таблица: {table}'}),
                'isBase64Encoded': False
            }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])

    try:
        if not is_admin(conn, payload['user_id']):
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно прав. Требуется роль Администратор'}),
                'isBase64Encoded': False
            }

        cleared_count = 0

        with conn.cursor() as cur:
            for table in tables_to_clear:
                try:
                    cur.execute(
                        sql.SQL("TRUNCATE TABLE {schema}.{table} RESTART IDENTITY CASCADE").format(
                            schema=sql.Identifier(SCHEMA),
                            table=sql.Identifier(table)
                        )
                    )
                    cleared_count += 1
                except Exception as e:
                    print(f"Failed to clear {table}: {e}")

            conn.commit()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'mode': mode,
                'tables_cleared': cleared_count,
                'message': 'Платежи и история успешно удалены' if mode != 'all' else 'Все данные успешно удалены'
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка при очистке данных'}),
            'isBase64Encoded': False
        }

    finally:
        conn.close()
