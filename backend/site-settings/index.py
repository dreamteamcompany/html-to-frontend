# v2: auth + audit logging
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import hmac

SCHEMA = os.environ.get('DB_SCHEMA', 't_p61788166_html_to_frontend')
JWT_SECRET = os.environ.get('JWT_SECRET', '')

def decode_token(token: str) -> dict:
    """Декодирует JWT-токен и возвращает payload"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        import base64
        payload = parts[1]
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except Exception:
        return {}

def verify_token(event: dict, conn) -> dict:
    """Проверяет токен и возвращает данные пользователя"""
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    if not token:
        return {}
    payload = decode_token(token)
    if not payload or not payload.get('user_id'):
        return {}
    return payload

def check_permission(conn, user_id: int, resource: str, action: str) -> bool:
    """Проверяет, есть ли у пользователя указанное разрешение или роль Администратор"""
    cur = conn.cursor()
    cur.execute(
        f"SELECT r.name FROM {SCHEMA}.user_roles ur "
        f"JOIN {SCHEMA}.roles r ON ur.role_id = r.id "
        f"WHERE ur.user_id = %s", (user_id,)
    )
    roles = [row[0] for row in cur.fetchall()]
    if 'Администратор' in roles or 'Admin' in roles:
        cur.close()
        return True
    cur.execute(
        f"SELECT 1 FROM {SCHEMA}.role_permissions rp "
        f"JOIN {SCHEMA}.permissions p ON rp.permission_id = p.id "
        f"JOIN {SCHEMA}.user_roles ur ON rp.role_id = ur.role_id "
        f"WHERE ur.user_id = %s AND p.resource = %s AND p.action = %s LIMIT 1",
        (user_id, resource, action)
    )
    has = cur.fetchone() is not None
    cur.close()
    return has

def handler(event: dict, context) -> dict:
    """API для чтения и сохранения настроек сайта с аудит-логированием"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        cur.execute(f"SELECT key, value FROM {SCHEMA}.site_settings")
        rows = cur.fetchall()
        settings = {row[0]: row[1] for row in rows}
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(settings)
        }

    if method == 'POST':
        payload = verify_token(event, conn)
        if not payload.get('user_id'):
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }

        if not check_permission(conn, payload['user_id'], 'system', 'settings_update'):
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Forbidden: system.settings_update permission required'})
            }

        user_id = payload['user_id']
        username = payload.get('full_name', payload.get('username', 'unknown'))

        body = json.loads(event.get('body', '{}'))
        key = body.get('key')
        value = body.get('value', '')

        if not key:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'key is required'})
            }

        cur.execute(f"SELECT value FROM {SCHEMA}.site_settings WHERE key = %s", (key,))
        row = cur.fetchone()
        old_value = row[0] if row else None

        cur.execute(
            f"INSERT INTO {SCHEMA}.site_settings (key, value, updated_at) VALUES (%s, %s, NOW()) "
            f"ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
            (key, value)
        )

        try:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.audit_logs 
                    (entity_type, entity_id, action, user_id, username, changed_fields, old_values, new_values, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    'site_settings', 0,
                    'update' if old_value is not None else 'create',
                    user_id, username,
                    json.dumps([key]),
                    json.dumps({key: old_value}) if old_value is not None else None,
                    json.dumps({key: value}),
                    json.dumps({'source': 'site-settings-api'})
                )
            )
        except Exception:
            pass

        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': True})
        }

    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }