import json
import os
import bcrypt
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
sys.path.append('/function/code')

def response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

def verify_token_and_permission(event: Dict[str, Any], conn, required_permission: str):
    import jwt
    
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return None, response(401, {'error': '\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044f'})
    
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None, response(500, {'error': 'Server configuration error'})
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None, response(401, {'error': '\u0422\u043e\u043a\u0435\u043d \u0438\u0441\u0442\u0435\u043a'})
    except jwt.InvalidTokenError:
        return None, response(401, {'error': '\u041d\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0442\u043e\u043a\u0435\u043d'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT DISTINCT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s
    """, (payload['user_id'],))
    
    permissions = [row['name'] for row in cur.fetchall()]
    cur.close()
    
    if required_permission not in permissions:
        return None, response(403, {'error': '\u041d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u043f\u0440\u0430\u0432'})
    
    return payload, None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return response(200, {})
    
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            user_payload, error = verify_token_and_permission(event, conn, 'users.read')
            if error:
                return error
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT 
                    u.id, u.username, u.email, u.full_name, u.is_active, 
                    u.created_at, u.last_login,
                    array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
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
            email = body_data.get('email', '').strip().lower()
            password = body_data.get('password', '')
            full_name = body_data.get('full_name', '').strip()
            role_ids = body_data.get('role_ids', [])
            
            if not username or not email or not password or not full_name:
                return response(400, {'error': '\u041b\u043e\u0433\u0438\u043d, email, \u043f\u0430\u0440\u043e\u043b\u044c \u0438 \u0438\u043c\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b'})
            
            if len(password) < 4:
                return response(400, {'error': '\u041f\u0430\u0440\u043e\u043b\u044c \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 4 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432'})
            
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            try:
                cur.execute("""
                    INSERT INTO users (username, email, password_hash, full_name, is_active)
                    VALUES (%s, %s, %s, %s, true)
                    RETURNING id, username, email, full_name, is_active, created_at
                """, (username, email, password_hash, full_name))
                
                new_user = cur.fetchone()
                
                if role_ids:
                    for role_id in role_ids:
                        cur.execute("""
                            INSERT INTO user_roles (user_id, role_id, assigned_by)
                            VALUES (%s, %s, %s)
                        """, (new_user['id'], role_id, user_payload['user_id']))
                
                conn.commit()
                cur.close()
                
                return response(201, dict(new_user))
            except psycopg2.IntegrityError as e:
                conn.rollback()
                cur.close()
                if 'username' in str(e):
                    return response(409, {'error': '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0441 \u0442\u0430\u043a\u0438\u043c \u043b\u043e\u0433\u0438\u043d\u043e\u043c \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442'})
                return response(409, {'error': '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0441 \u0442\u0430\u043a\u0438\u043c email \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442'})
        
        elif method == 'PUT':
            user_payload, error = verify_token_and_permission(event, conn, 'users.update')
            if error:
                return error
            
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = query_params.get('id')
            
            if not user_id:
                return response(400, {'error': 'ID \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d'})
            
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            if action == 'toggle_active':
                cur.execute("""
                    UPDATE users SET is_active = NOT is_active 
                    WHERE id = %s
                    RETURNING id, username, email, full_name, is_active
                """, (user_id,))
                
                updated_user = cur.fetchone()
                conn.commit()
                cur.close()
                
                return response(200, dict(updated_user))
            
            else:
                username = body_data.get('username')
                email = body_data.get('email')
                full_name = body_data.get('full_name')
                password = body_data.get('password')
                role_ids = body_data.get('role_ids')
                
                if username:
                    cur.execute("UPDATE users SET username = %s WHERE id = %s", (username, user_id))
                if email:
                    cur.execute("UPDATE users SET email = %s WHERE id = %s", (email.lower(), user_id))
                if full_name:
                    cur.execute("UPDATE users SET full_name = %s WHERE id = %s", (full_name, user_id))
                if password and len(password) >= 4:
                    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (password_hash, user_id))
                
                if role_ids is not None:
                    cur.execute("DELETE FROM user_roles WHERE user_id = %s", (user_id,))
                    for role_id in role_ids:
                        cur.execute("""
                            INSERT INTO user_roles (user_id, role_id, assigned_by)
                            VALUES (%s, %s, %s)
                        """, (user_id, role_id, user_payload['user_id']))
                
                conn.commit()
                
                cur.execute("""
                    SELECT id, username, email, full_name, is_active, created_at
                    FROM users WHERE id = %s
                """, (user_id,))
                
                updated_user = cur.fetchone()
                cur.close()
                
                return response(200, dict(updated_user))
        
        return response(405, {'error': '\u041c\u0435\u0442\u043e\u0434 \u043d\u0435 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044f'})
    
    finally:
        conn.close()
