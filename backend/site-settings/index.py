# v2: auth + audit logging
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import hmac

SCHEMA = os.environ.get('DB_SCHEMA', 't_p61788166_html_to_frontend')
JWT_SECRET = os.environ.get('JWT_SECRET', '')

def verify_token(event: dict, conn) -> dict:
    """Проверяет JWT токен с верификацией подписи через HMAC"""
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    if not token:
        return {}
    
    try:
        import base64
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        
        if JWT_SECRET:
            signing_input = f'{parts[0]}.{parts[1]}'.encode('utf-8')
            signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
            
            sig_from_token = parts[2]
            sig_padding = 4 - len(sig_from_token) % 4
            if sig_padding != 4:
                sig_from_token += '=' * sig_padding
            try:
                token_signature = base64.urlsafe_b64decode(sig_from_token)
            except Exception:
                return {}
            
            if not hmac.compare_digest(signature, token_signature):
                return {}
        
        payload_part = parts[1]
        padding = 4 - len(payload_part) % 4
        if padding != 4:
            payload_part += '=' * padding
        decoded = base64.urlsafe_b64decode(payload_part)
        payload = json.loads(decoded)
        
        if not payload or not payload.get('user_id'):
            return {}
        return payload
    except Exception:
        return {}

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