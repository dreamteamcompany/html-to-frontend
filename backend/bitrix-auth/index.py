import json
import os
import sys
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from urllib.parse import urlencode
import urllib.request

SCHEMA = 't_p61788166_html_to_frontend'
BITRIX_DOMAIN = 'https://bitrix.dreamteamcompany.ru'

def log(msg):
    print(msg, file=sys.stderr, flush=True)

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json',
    }

def response(status, body):
    return {
        'statusCode': status,
        'headers': cors_headers(),
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }

def get_db():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    return conn

def create_jwt_token(user_id, username):
    secret = os.environ['JWT_SECRET']
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def get_user_with_permissions(cursor, user_id):
    cursor.execute(
        "SELECT id, username, email, full_name, is_active, last_login, photo_url"
        " FROM " + SCHEMA + ".users WHERE id = %s",
        (user_id,)
    )
    user = cursor.fetchone()
    if not user:
        return None

    cursor.execute(
        "SELECT r.id, r.name, r.description"
        " FROM " + SCHEMA + ".roles r"
        " JOIN " + SCHEMA + ".user_roles ur ON ur.role_id = r.id"
        " WHERE ur.user_id = %s",
        (user_id,)
    )
    roles = cursor.fetchall()

    cursor.execute(
        "SELECT DISTINCT p.name, p.resource, p.action"
        " FROM " + SCHEMA + ".permissions p"
        " JOIN " + SCHEMA + ".role_permissions rp ON rp.permission_id = p.id"
        " JOIN " + SCHEMA + ".user_roles ur ON ur.role_id = rp.role_id"
        " WHERE ur.user_id = %s",
        (user_id,)
    )
    permissions = cursor.fetchall()

    return {
        **dict(user),
        'roles': [dict(r) for r in roles],
        'permissions': [dict(p) for p in permissions],
    }

def handler(event, context):
    """Авторизация через коробочный Битрикс24 по OAuth 2.0"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if action == 'login':
        return handle_login()
    elif action == 'callback':
        return handle_callback(params)
    elif action == 'config':
        return handle_config()
    else:
        return response(400, {'error': 'Unknown action. Use: login, callback, config'})

def handle_config():
    client_id = os.environ.get('BITRIX_CLIENT_ID', '')
    return response(200, {
        'bitrix_domain': BITRIX_DOMAIN,
        'client_id': client_id,
        'configured': bool(client_id),
    })

def handle_login():
    client_id = os.environ.get('BITRIX_CLIENT_ID')
    if not client_id:
        return response(500, {'error': 'BITRIX_CLIENT_ID not configured'})

    redirect_uri = os.environ.get('BITRIX_REDIRECT_URI', '')

    auth_url = BITRIX_DOMAIN + '/oauth/authorize/?' + urlencode({
        'client_id': client_id,
        'response_type': 'code',
        'redirect_uri': redirect_uri,
    })

    return response(200, {'auth_url': auth_url})

def handle_callback(params):
    code = params.get('code')
    if not code:
        return response(400, {'error': 'Missing code parameter'})

    client_id = os.environ.get('BITRIX_CLIENT_ID')
    client_secret = os.environ.get('BITRIX_CLIENT_SECRET')
    if not client_id or not client_secret:
        return response(500, {'error': 'Bitrix OAuth not configured'})

    redirect_uri = os.environ.get('BITRIX_REDIRECT_URI', '')

    token_url = BITRIX_DOMAIN + '/oauth/token/?' + urlencode({
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'code': code,
    })

    try:
        req = urllib.request.Request(token_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            token_data = json.loads(resp.read().decode())
    except Exception as e:
        log("Bitrix token error: " + str(e))
        return response(502, {'error': 'Failed to get token from Bitrix'})

    access_token = token_data.get('access_token')
    if not access_token:
        log("Bitrix token response: " + json.dumps(token_data))
        return response(502, {'error': 'Bitrix did not return access_token'})

    try:
        user_url = BITRIX_DOMAIN + '/rest/user.current.json?auth=' + access_token
        req = urllib.request.Request(user_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            user_data = json.loads(resp.read().decode())
    except Exception as e:
        log("Bitrix user error: " + str(e))
        return response(502, {'error': 'Failed to get user from Bitrix'})

    bx_user = user_data.get('result', {})
    bx_email = (bx_user.get('EMAIL') or '').strip().lower()

    if not bx_email:
        return response(400, {'error': 'Bitrix user has no email'})

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, username, is_active FROM " + SCHEMA + ".users WHERE LOWER(email) = %s",
                (bx_email,)
            )
            local_user = cur.fetchone()

            if not local_user:
                return response(403, {
                    'error': 'User with email ' + bx_email + ' not found in system'
                })

            if not local_user['is_active']:
                return response(403, {'error': 'Account is deactivated'})

            moscow_tz = ZoneInfo('Europe/Moscow')
            now = datetime.now(moscow_tz).strftime('%Y-%m-%d %H:%M:%S')
            cur.execute(
                "UPDATE " + SCHEMA + ".users SET last_login = %s WHERE id = %s",
                (now, local_user['id'])
            )

            user_full = get_user_with_permissions(cur, local_user['id'])
            if not user_full:
                return response(500, {'error': 'Failed to load user profile'})

            token = create_jwt_token(local_user['id'], local_user['username'])

            return response(200, {
                'token': token,
                'user': user_full,
            })
    finally:
        conn.close()
