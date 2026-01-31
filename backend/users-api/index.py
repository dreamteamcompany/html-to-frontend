import json
import os
import sys
import jwt
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

SCHEMA = 't_p61788166_html_to_frontend'
VERSION = '1.0.0'

def log(msg):
    print(msg, file=sys.stderr, flush=True)

def response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def verify_jwt_token(token: str):
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except:
        return None

def verify_token_and_permission(event: Dict[str, Any], conn, required_permission: str):
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return None, response(401, {'error': 'Требуется авторизация'})
    
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None, response(500, {'error': 'Server configuration error'})
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None, response(401, {'error': 'Токен истек'})
    except jwt.InvalidTokenError:
        return None, response(401, {'error': 'Недействительный токен'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем, является ли пользователь администратором
    cur.execute(f"""
        SELECT r.name
        FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s
    """, (payload['user_id'],))
    
    roles = [row['name'] for row in cur.fetchall()]
    
    # Если у пользователя роль администратора - даём полный доступ
    if 'Администратор' in roles or 'Admin' in roles:
        cur.close()
        return payload, None
    
    # Иначе проверяем конкретное разрешение
    cur.execute(f"""
        SELECT DISTINCT p.name
        FROM {SCHEMA}.permissions p
        JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id
        JOIN {SCHEMA}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s AND p.name = %s
    """, (payload['user_id'], required_permission))
    
    if cur.fetchone():
        cur.close()
        return payload, None
    
    cur.close()
    return None, response(403, {'error': 'Недостаточно прав'})

def handle_approvers(event: Dict[str, Any], conn) -> Dict[str, Any]:
    """Получить список пользователей для выбора согласующих - доступно всем авторизованным"""
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return response(401, {'error': 'Требуется авторизация'})
    
    payload = verify_jwt_token(token)
    if not payload:
        return response(401, {'error': 'Недействительный токен'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT 
            u.id, u.full_name, u.position,
            COALESCE(
                array_agg(r.name) FILTER (WHERE r.id IS NOT NULL),
                ARRAY[]::text[]
            ) as roles
        FROM {SCHEMA}.users u
        LEFT JOIN {SCHEMA}.user_roles ur ON u.id = ur.user_id
        LEFT JOIN {SCHEMA}.roles r ON ur.role_id = r.id
        WHERE u.is_active = true
        GROUP BY u.id
        ORDER BY u.full_name
    """)
    
    approvers = [dict(row) for row in cur.fetchall()]
    cur.close()
    
    return response(200, approvers)

def handle_users(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    if method == 'GET':
        user_payload, error = verify_token_and_permission(event, conn, 'users.read')
        if error:
            return error
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"""
            SELECT 
                u.id, u.username, u.full_name, u.position, u.photo_url, u.is_active, 
                u.created_at, u.last_login,
                COALESCE(
                    array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL),
                    ARRAY[]::json[]
                ) as roles
            FROM {SCHEMA}.users u
            LEFT JOIN {SCHEMA}.user_roles ur ON u.id = ur.user_id
            LEFT JOIN {SCHEMA}.roles r ON ur.role_id = r.id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        """)
        
        users = [dict(row) for row in cur.fetchall()]
        cur.close()
        
        return response(200, users)
    
    elif method == 'POST':
        user_payload, error = verify_token_and_permission(event, conn, 'users.create')
        if error:
            return error
        
        body_data = json.loads(event.get('body', '{}'))
        username = body_data.get('username', '').strip()
        password = body_data.get('password', '')
        full_name = body_data.get('full_name', '').strip()
        position = body_data.get('position', '').strip()
        photo_url = body_data.get('photo_url', '').strip()
        role_ids = body_data.get('role_ids', [])
        
        if not username or not password or not full_name:
            return response(400, {'error': 'Логин, пароль и имя обязательны'})
        
        if len(password) < 4:
            return response(400, {'error': 'Пароль должен быть не менее 4 символов'})
        
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.users (username, password_hash, full_name, position, photo_url, email, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, true)
                RETURNING id, username, full_name, position, photo_url, is_active, created_at
            """, (username, password_hash, full_name, position, photo_url, username + '@example.com'))
            
            new_user = cur.fetchone()
            
            if role_ids:
                for role_id in role_ids:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.user_roles (user_id, role_id, assigned_by)
                        VALUES (%s, %s, %s)
                    """, (new_user['id'], role_id, user_payload['user_id']))
            
            conn.commit()
            
            cur.execute(f"""
                SELECT 
                    u.id, u.username, u.full_name, u.position, u.photo_url, u.is_active, 
                    u.created_at, u.last_login,
                    COALESCE(
                        array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL),
                        ARRAY[]::json[]
                    ) as roles
                FROM {SCHEMA}.users u
                LEFT JOIN {SCHEMA}.user_roles ur ON u.id = ur.user_id
                LEFT JOIN {SCHEMA}.roles r ON ur.role_id = r.id
                WHERE u.id = %s
                GROUP BY u.id
            """, (new_user['id'],))
            
            created_user = cur.fetchone()
            cur.close()
            
            return response(201, dict(created_user))
        except psycopg2.IntegrityError:
            conn.rollback()
            cur.close()
            return response(409, {'error': 'Пользователь с таким логином уже существует'})
    
    elif method == 'PUT':
        user_payload, error = verify_token_and_permission(event, conn, 'users.update')
        if error:
            return error
        
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('id')
        
        if not user_id:
            return response(400, {'error': 'ID пользователя обязателен'})
        
        body_data = json.loads(event.get('body', '{}'))
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if 'is_active' in body_data:
            cur.execute(f"""
                UPDATE {SCHEMA}.users SET is_active = %s
                WHERE id = %s
                RETURNING id, username, full_name, position, photo_url, is_active
            """, (body_data['is_active'], user_id))
            
            updated_user = cur.fetchone()
            conn.commit()
            cur.close()
            
            return response(200, dict(updated_user))
        
        username = body_data.get('username', '').strip()
        full_name = body_data.get('full_name', '').strip()
        position = body_data.get('position', '').strip()
        photo_url = body_data.get('photo_url', '').strip()
        password = body_data.get('password')
        role_ids = body_data.get('role_ids')
        
        if not username or not full_name:
            return response(400, {'error': 'Логин и имя обязательны'})
        
        try:
            cur.execute(f"""
                UPDATE {SCHEMA}.users 
                SET username = %s, full_name = %s, position = %s, photo_url = %s
                WHERE id = %s
            """, (username, full_name, position, photo_url, user_id))
            
            if password and len(password) >= 4:
                password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cur.execute(f"UPDATE {SCHEMA}.users SET password_hash = %s WHERE id = %s", (password_hash, user_id))
            
            if role_ids is not None:
                cur.execute(f"DELETE FROM {SCHEMA}.user_roles WHERE user_id = %s", (user_id,))
                for role_id in role_ids:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.user_roles (user_id, role_id, assigned_by)
                        VALUES (%s, %s, %s)
                    """, (user_id, role_id, user_payload['user_id']))
            
            conn.commit()
            
            cur.execute(f"""
                SELECT 
                    u.id, u.username, u.full_name, u.position, u.photo_url, u.is_active, 
                    u.created_at, u.last_login,
                    COALESCE(
                        array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL),
                        ARRAY[]::json[]
                    ) as roles
                FROM {SCHEMA}.users u
                LEFT JOIN {SCHEMA}.user_roles ur ON u.id = ur.user_id
                LEFT JOIN {SCHEMA}.roles r ON ur.role_id = r.id
                WHERE u.id = %s
                GROUP BY u.id
            """, (user_id,))
            
            updated_user = cur.fetchone()
            cur.close()
            
            if not updated_user:
                return response(404, {'error': 'Пользователь не найден'})
            
            return response(200, dict(updated_user))
        except psycopg2.IntegrityError:
            conn.rollback()
            cur.close()
            return response(409, {'error': 'Пользователь с таким логином уже существует'})
    
    elif method == 'DELETE':
        user_payload, error = verify_token_and_permission(event, conn, 'users.delete')
        if error:
            return error
        
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('id')
        
        if not user_id:
            return response(400, {'error': 'ID пользователя обязателен'})
        
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.users WHERE id = %s", (user_id,))
        conn.commit()
        cur.close()
        
        return response(200, {'message': 'Пользователь удалён'})
    
    return response(405, {'error': f'Метод {method} не поддерживается'})

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """API для управления пользователями и списка согласующих"""
    log(f"[users-api] Event: {event.get('httpMethod')} {event.get('queryStringParameters')}")
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return response(200, {})
    
    params = event.get('queryStringParameters') or {}
    endpoint = params.get('endpoint', 'users')
    
    conn = get_db_connection()
    
    try:
        if endpoint == 'approvers':
            return handle_approvers(event, conn)
        elif endpoint == 'users':
            return handle_users(method, event, conn)
        else:
            return response(404, {'error': 'Endpoint not found'})
    finally:
        conn.close()
