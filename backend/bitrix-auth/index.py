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
from urllib.parse import urlencode
import urllib.request
import urllib.error

SCHEMA = 't_p61788166_html_to_frontend'
BITRIX_DOMAIN = 'https://bitrix.dreamteamcompany.ru'

def log(msg):
    print(msg, file=sys.stderr, flush=True)

def response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(dsn)

def create_jwt_token(user_id: int, email: str) -> str:
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        raise Exception('JWT_SECRET not configured')
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, secret, algorithm='HS256')

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
    return {
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'full_name': user['full_name'],
        'is_active': user['is_active'],
        'last_login': user['last_login'],
        'photo_url': user.get('photo_url', ''),
        'roles': roles,
        'permissions': permissions
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Авторизация через Битрикс24 — login и callback"""
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    endpoint = params.get('endpoint', 'login')

    log(f"[BITRIX-AUTH] Method={method} Endpoint={endpoint}")

    if method == 'OPTIONS':
        return response(200, {})

    if endpoint == 'login':
        return handle_bitrix_login()

    if endpoint == 'callback':
        return handle_bitrix_callback(event)

    return response(404, {'error': 'Unknown endpoint'})

def handle_bitrix_login() -> Dict[str, Any]:
    client_id = os.environ.get('BITRIX_CLIENT_ID')
    if not client_id:
        return response(500, {'error': 'BITRIX_CLIENT_ID не настроен'})
    redirect_uri = os.environ.get('BITRIX_REDIRECT_URI')
    if not redirect_uri:
        return response(500, {'error': 'BITRIX_REDIRECT_URI не настроен'})
    auth_url = BITRIX_DOMAIN + '/oauth/authorize/?' + urlencode({
        'client_id': client_id,
        'response_type': 'code',
        'redirect_uri': redirect_uri,
    })
    return response(200, {'auth_url': auth_url})

def handle_bitrix_callback(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    code = params.get('code')
    if not code:
        return response(400, {'error': 'Отсутствует code от Битрикс'})

    client_id = os.environ.get('BITRIX_CLIENT_ID')
    client_secret = os.environ.get('BITRIX_CLIENT_SECRET')
    if not client_id or not client_secret:
        return response(500, {'error': 'Битрикс OAuth не настроен'})

    redirect_uri = os.environ.get('BITRIX_REDIRECT_URI', '')

    token_url = BITRIX_DOMAIN + '/oauth/token/'
    token_params = urlencode({
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'code': code,
    })

    log(f"[BITRIX-AUTH] Token URL: {token_url}")
    log(f"[BITRIX-AUTH] redirect_uri={redirect_uri}")

    try:
        req = urllib.request.Request(token_url, data=token_params.encode('utf-8'), method='POST')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode()
            log(f"[BITRIX-AUTH] Token response: {raw[:500]}")
            token_data = json.loads(raw)
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ''
        log(f"[BITRIX-AUTH] Token HTTP error {e.code}: {body[:500]}")
        return response(502, {'error': f'Битрикс вернул ошибку {e.code}'})
    except Exception as e:
        log(f"[BITRIX-AUTH] Token error: {type(e).__name__}: {e}")
        return response(502, {'error': 'Не удалось получить токен от Битрикс'})

    access_token = token_data.get('access_token')
    if not access_token:
        log(f"Bitrix token response: {token_data}")
        return response(502, {'error': 'Битрикс не вернул access_token'})

    try:
        user_url = BITRIX_DOMAIN + '/rest/user.current.json?auth=' + access_token
        req = urllib.request.Request(user_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            user_data = json.loads(resp.read().decode())
    except Exception as e:
        log(f"Bitrix user error: {e}")
        return response(502, {'error': 'Не удалось получить профиль из Битрикс'})

    bx_user = user_data.get('result', {})
    bx_email = (bx_user.get('EMAIL') or '').strip().lower()
    if not bx_email:
        return response(400, {'error': 'У пользователя Битрикс не заполнен email'})

    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"""
            SELECT id, username, is_active FROM {SCHEMA}.users
            WHERE LOWER(email) = %s
        """, (bx_email,))
        local_user = cur.fetchone()
        cur.close()

        if not local_user:
            return response(403, {
                'error': f'Пользователь с email {bx_email} не найден в системе. Обратитесь к администратору.'
            })

        if not local_user['is_active']:
            return response(403, {'error': 'Учётная запись деактивирована'})

        cur = conn.cursor()
        moscow_tz = ZoneInfo('Europe/Moscow')
        now = datetime.now(moscow_tz).strftime('%Y-%m-%d %H:%M:%S')
        cur.execute(f"""
            UPDATE {SCHEMA}.users SET last_login = %s WHERE id = %s
        """, (now, local_user['id']))
        conn.commit()
        cur.close()

        user_full = get_user_with_permissions(conn, local_user['id'])
        if not user_full:
            return response(500, {'error': 'Ошибка загрузки профиля'})

        token = create_jwt_token(local_user['id'], local_user['username'])
        return response(200, {'token': token, 'user': user_full})
    finally:
        conn.close()