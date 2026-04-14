import json
import os
import sys
import jwt
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

SCHEMA = 't_p61788166_html_to_frontend'
LOGIN_MAX_ATTEMPTS = 10
LOGIN_LOCKOUT_MINUTES = 15
MAX_FIELD_LENGTH = 256


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def response(status_code: int, data: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(data, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)


def create_jwt_token(user_id: int) -> str:
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        raise ValueError('JWT_SECRET not configured')
    now = datetime.utcnow()
    payload = {
        'user_id': user_id,
        'iat': now,
        'exp': now + timedelta(hours=24),
    }
    return jwt.encode(payload, secret, algorithm='HS256')


def verify_token(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    headers = event.get('headers', {})
    token = (
        headers.get('X-Auth-Token') or
        headers.get('x-auth-token') or
        headers.get('X-Authorization', '').replace('Bearer ', '')
    )
    if not token:
        return None
    try:
        secret = os.environ.get('JWT_SECRET')
        if not secret:
            return None
        return jwt.decode(token, secret, algorithms=['HS256'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def check_rate_limit(conn, ip: str, username: str) -> bool:
    """Возвращает True если вход разрешён, False если заблокирован"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    window_start = datetime.utcnow() - timedelta(minutes=LOGIN_LOCKOUT_MINUTES)
    cur.execute(f"""
        SELECT COUNT(*) AS cnt
        FROM {SCHEMA}.login_attempts
        WHERE (ip_address = %s OR username = %s)
          AND success = false
          AND attempted_at > %s
    """, (ip, username, window_start))
    row = cur.fetchone()
    cur.close()
    return (row['cnt'] if row else 0) < LOGIN_MAX_ATTEMPTS


def record_login_attempt(conn, ip: str, username: str, success: bool):
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.login_attempts (ip_address, username, success, attempted_at)
        VALUES (%s, %s, %s, %s)
    """, (ip, username[:128], success, datetime.utcnow()))
    conn.commit()
    cur.close()


def get_user_with_permissions(conn, user_id: int) -> Optional[Dict[str, Any]]:
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT u.id, u.username, u.email, u.full_name, u.is_active, u.last_login, u.photo_url
        FROM {SCHEMA}.users u
        WHERE u.id = %s AND u.is_active = true
    """, (user_id,))

    user = cur.fetchone()
    if not user:
        cur.close()
        return None

    cur.execute(f"""
        SELECT DISTINCT p.name, p.resource, p.action
        FROM {SCHEMA}.permissions p
        JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id
        JOIN {SCHEMA}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s
    """, (user_id,))
    permissions = [dict(row) for row in cur.fetchall()]

    cur.execute(f"""
        SELECT r.id, r.name, r.description
        FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s
    """, (user_id,))
    roles = [dict(row) for row in cur.fetchall()]

    cur.close()

    result = dict(user)
    result['roles'] = roles
    result['permissions'] = permissions

    if result.get('last_login'):
        result['last_login'] = result['last_login'].isoformat()

    return result


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """API для авторизации и получения данных текущего пользователя."""
    method = event.get('httpMethod', 'GET')
    endpoint = (event.get('queryStringParameters') or {}).get('endpoint', '')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    try:
        conn = get_db_connection()
    except Exception:
        return response(500, {'error': 'Ошибка соединения с базой данных'})

    try:
        if endpoint == 'login' and method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            username = str(body_data.get('username', '')).strip()[:MAX_FIELD_LENGTH]
            password = str(body_data.get('password', ''))[:MAX_FIELD_LENGTH]

            if not username or not password:
                conn.close()
                return response(400, {'error': 'Логин и пароль обязательны'})

            ip = (event.get('requestContext', {}) or {}).get('identity', {}).get('sourceIp', '0.0.0.0')

            if not check_rate_limit(conn, ip, username):
                record_login_attempt(conn, ip, username, False)
                conn.close()
                return response(429, {'error': f'Слишком много попыток входа. Попробуйте через {LOGIN_LOCKOUT_MINUTES} минут'})

            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(f"""
                SELECT id, email, username, password_hash, full_name, is_active
                FROM {SCHEMA}.users
                WHERE username = %s
            """, (username,))
            user = cur.fetchone()
            cur.close()

            if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                record_login_attempt(conn, ip, username, False)
                conn.close()
                return response(401, {'error': 'Неверный логин или пароль'})

            if not user['is_active']:
                record_login_attempt(conn, ip, username, False)
                conn.close()
                return response(403, {'error': 'Пользователь деактивирован'})

            record_login_attempt(conn, ip, username, True)

            moscow_tz = ZoneInfo('Europe/Moscow')
            now_moscow = datetime.now(moscow_tz).replace(tzinfo=None)
            cur = conn.cursor()
            cur.execute(f"""
                UPDATE {SCHEMA}.users SET last_login = %s WHERE id = %s
            """, (now_moscow, user['id']))
            conn.commit()
            cur.close()

            token = create_jwt_token(user['id'])
            user_data = get_user_with_permissions(conn, user['id'])

            conn.close()
            return response(200, {'token': token, 'user': user_data})

        elif endpoint == 'me' and method == 'GET':
            payload = verify_token(event)
            if not payload:
                conn.close()
                return response(401, {'error': 'Unauthorized'})

            user_data = get_user_with_permissions(conn, payload['user_id'])
            conn.close()

            if not user_data:
                return response(404, {'error': 'Пользователь не найден'})

            return response(200, user_data)

        elif endpoint == 'health' and method == 'GET':
            conn.close()
            return response(200, {'status': 'healthy'})

        conn.close()
        return response(404, {'error': 'Endpoint not found'})

    except Exception as e:
        log(f"[auth-api] Error: {e}")
        try:
            conn.close()
        except Exception:
            pass
        return response(500, {'error': 'Внутренняя ошибка сервера'})