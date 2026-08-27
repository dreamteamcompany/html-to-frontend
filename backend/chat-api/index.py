"""API для раздела «Чат»: показывает переписку CEO с Битрикс-ботом внутри системы."""
import json
import os
import sys
from typing import Dict, Any
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p61788166_html_to_frontend'
DSN = os.environ['DATABASE_URL']


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def response(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id, X-Clinic-Id',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def verify_token(event: Dict[str, Any]) -> tuple:
    headers = event.get('headers', {}) or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or
             headers.get('X-Authorization') or headers.get('x-authorization', ''))
    if token:
        token = token.replace('Bearer ', '').strip()
    if not token:
        return None, response(401, {'error': 'Unauthorized'})
    try:
        secret = os.environ.get('JWT_SECRET')
        if not secret:
            return None, response(500, {'error': 'Server configuration error'})
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, response(401, {'error': 'Token expired'})
    except jwt.InvalidTokenError:
        return None, response(401, {'error': 'Invalid token'})


def has_chat_permission(conn, user_id: int) -> bool:
    cur = conn.cursor()
    cur.execute(f"""
        SELECT COUNT(*) FROM {SCHEMA}.permissions p
        JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id
        JOIN {SCHEMA}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s AND p.resource = 'chat' AND p.action = 'read'
    """, (user_id,))
    has = (cur.fetchone() or [0])[0] > 0
    cur.close()
    return has


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Отдаёт историю сообщений, которые пользователи (CEO) пишут боту Битрикс24 напрямую.
    Доступно только пользователям с правом chat.read (Администратор, CEO).
    """
    if event.get('httpMethod') == 'OPTIONS':
        return response(200, {})

    if event.get('httpMethod') != 'GET':
        return response(405, {'error': 'Method not allowed'})

    payload, error = verify_token(event)
    if error:
        return error

    conn = psycopg2.connect(DSN)
    try:
        if not has_chat_permission(conn, payload['user_id']):
            return response(403, {'error': 'Forbidden'})

        qs = event.get('queryStringParameters') or {}
        try:
            limit = min(int(qs.get('limit', 200)), 500)
        except (ValueError, TypeError):
            limit = 200

        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"""
            SELECT m.id, m.bitrix_user_id, m.user_id, m.message_text, m.created_at,
                   u.full_name AS user_full_name, u.username AS user_username, u.photo_url AS user_photo_url
            FROM {SCHEMA}.bitrix_chat_messages m
            LEFT JOIN {SCHEMA}.users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
            LIMIT %s
        """, (limit,))
        messages = [dict(row) for row in cur.fetchall()]
        cur.close()

        return response(200, {'messages': messages})
    finally:
        conn.close()
