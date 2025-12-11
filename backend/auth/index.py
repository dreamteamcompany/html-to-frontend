import json
import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_user_with_permissions(conn, user_id: int) -> Optional[Dict[str, Any]]:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT u.id, u.email, u.full_name, u.is_active, u.last_login
        FROM users u
        WHERE u.id = %s AND u.is_active = true
    """, (user_id,))
    
    user = cur.fetchone()
    if not user:
        cur.close()
        return None
    
    cur.execute("""
        SELECT DISTINCT p.name, p.resource, p.action
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s
    """, (user_id,))
    
    permissions = [dict(row) for row in cur.fetchall()]
    
    cur.execute("""
        SELECT r.id, r.name, r.description
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s
    """, (user_id,))
    
    roles = [dict(row) for row in cur.fetchall()]
    
    cur.close()
    
    return {
        'id': user['id'],
        'email': user['email'],
        'full_name': user['full_name'],
        'is_active': user['is_active'],
        'last_login': user['last_login'],
        'roles': roles,
        'permissions': permissions
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return response(200, {})
    
    conn = get_db_connection()
    
    try:
        if method == 'POST':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action', 'login')
            body_data = json.loads(event.get('body', '{}'))
            
            if action == 'login':
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                
                if not email or not password:
                    return response(400, {'error': 'Email и пароль обязательны'})
                
                cur = conn.cursor(cursor_factory=RealDictCursor)
                cur.execute("""
                    SELECT id, email, password_hash, full_name, is_active
                    FROM users
                    WHERE email = %s
                """, (email,))
                
                user = cur.fetchone()
                cur.close()
                
                if not user:
                    return response(401, {'error': 'Неверный email или пароль'})
                
                if not user['is_active']:
                    return response(403, {'error': 'Пользователь деактивирован'})
                
                if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                    return response(401, {'error': 'Неверный email или пароль'})
                
                cur = conn.cursor()
                cur.execute("""
                    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s
                """, (user['id'],))
                conn.commit()
                cur.close()
                
                token = create_jwt_token(user['id'], user['email'])
                user_data = get_user_with_permissions(conn, user['id'])
                
                return response(200, {
                    'token': token,
                    'user': user_data
                })
            
            elif action == 'register':
                token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
                if not token:
                    return response(401, {'error': 'Требуется авторизация'})
                
                payload = verify_jwt_token(token)
                if not payload:
                    return response(401, {'error': 'Недействительный токен'})
                
                admin_user = get_user_with_permissions(conn, payload['user_id'])
                if not admin_user:
                    return response(403, {'error': 'Доступ запрещен'})
                
                has_permission = any(p['name'] == 'users.create' for p in admin_user['permissions'])
                if not has_permission:
                    return response(403, {'error': 'Недостаточно прав для создания пользователей'})
                
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                full_name = body_data.get('full_name', '').strip()
                role_id = body_data.get('role_id')
                
                if not email or not password or not full_name:
                    return response(400, {'error': 'Email, пароль и имя обязательны'})
                
                if len(password) < 6:
                    return response(400, {'error': 'Пароль должен быть не менее 6 символов'})
                
                password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                try:
                    cur.execute("""
                        INSERT INTO users (email, password_hash, full_name, is_active)
                        VALUES (%s, %s, %s, true)
                        RETURNING id, email, full_name, is_active, created_at
                    """, (email, password_hash, full_name))
                    
                    new_user = cur.fetchone()
                    
                    if role_id:
                        cur.execute("""
                            INSERT INTO user_roles (user_id, role_id, assigned_by)
                            VALUES (%s, %s, %s)
                        """, (new_user['id'], role_id, admin_user['id']))
                    
                    conn.commit()
                    cur.close()
                    
                    return response(201, {
                        'id': new_user['id'],
                        'email': new_user['email'],
                        'full_name': new_user['full_name'],
                        'is_active': new_user['is_active'],
                        'created_at': new_user['created_at']
                    })
                except psycopg2.IntegrityError:
                    conn.rollback()
                    cur.close()
                    return response(409, {'error': 'Пользователь с таким email уже существует'})
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action', 'me')
            
            if action == 'me':
                token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
                if not token:
                    return response(401, {'error': 'Требуется авторизация'})
                
                payload = verify_jwt_token(token)
                if not payload:
                    return response(401, {'error': 'Недействительный токен'})
                
                user_data = get_user_with_permissions(conn, payload['user_id'])
                if not user_data:
                    return response(404, {'error': 'Пользователь не найден'})
                
                return response(200, {'user': user_data})
        
        return response(405, {'error': 'Метод не поддерживается'})
    
    finally:
        conn.close()