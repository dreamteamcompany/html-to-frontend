import json
import os
import jwt
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

SCHEMA = 't_p61788166_html_to_frontend'

# Pydantic models for validation
class PaymentRequest(BaseModel):
    category_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    description: str = Field(default='')
    payment_date: str = Field(default='')
    legal_entity_id: int = Field(default=None)
    contractor_id: int = Field(default=None)
    department_id: int = Field(default=None)
    service_id: int = Field(default=None)
    invoice_number: str = Field(default=None)
    invoice_date: str = Field(default=None)

class CategoryRequest(BaseModel):
    name: str = Field(..., min_length=1)
    icon: str = Field(default='Tag')

class LegalEntityRequest(BaseModel):
    name: str = Field(..., min_length=1)
    inn: str = Field(default='')
    kpp: str = Field(default='')
    address: str = Field(default='')

class CustomFieldRequest(BaseModel):
    name: str = Field(..., min_length=1)
    field_type: str = Field(..., pattern='^(text|select|file|toggle)$')
    options: str = Field(default='')

class ContractorRequest(BaseModel):
    name: str = Field(..., min_length=1)
    inn: str = Field(default='')
    kpp: str = Field(default='')
    ogrn: str = Field(default='')
    legal_address: str = Field(default='')
    actual_address: str = Field(default='')
    phone: str = Field(default='')
    email: str = Field(default='')
    contact_person: str = Field(default='')
    bank_name: str = Field(default='')
    bank_bik: str = Field(default='')
    bank_account: str = Field(default='')
    correspondent_account: str = Field(default='')
    notes: str = Field(default='')

class CustomerDepartmentRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(default='')

class RoleRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(default='')
    permission_ids: list[int] = Field(default=[])

class PermissionRequest(BaseModel):
    name: str = Field(..., min_length=1)
    resource: str = Field(..., min_length=1)
    action: str = Field(..., min_length=1)
    description: str = Field(default='')

class ApprovalActionRequest(BaseModel):
    payment_id: int = Field(..., gt=0)
    action: str = Field(..., pattern='^(approve|reject)$')
    comment: str = Field(default='')

class ServiceRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(default='')
    intermediate_approver_id: int = Field(..., gt=0)
    final_approver_id: int = Field(..., gt=0)

# Utility functions
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
        SELECT u.id, u.username, u.email, u.full_name, u.is_active, u.last_login
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
        'username': user['username'],
        'email': user['email'],
        'full_name': user['full_name'],
        'is_active': user['is_active'],
        'last_login': user['last_login'],
        'roles': roles,
        'permissions': permissions
    }

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
    cur.execute("""
        SELECT r.name
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s
    """, (payload['user_id'],))
    
    roles = [row['name'] for row in cur.fetchall()]
    
    # Если у пользователя роль администратора - даём полный доступ
    if 'Администратор' in roles or 'Admin' in roles:
        cur.close()
        return payload, None
    
    # Иначе проверяем конкретное разрешение
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
        return None, response(403, {'error': 'Недостаточно прав'})
    
    return payload, None

def verify_token(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return None
    
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except:
        return None

def get_user_role(conn, user_id: int) -> str:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT r.name 
        FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s
        LIMIT 1
    """, (user_id,))
    
    result = cur.fetchone()
    cur.close()
    return result['name'] if result else 'user'

# Main handler
def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    endpoint = params.get('endpoint', '')
    
    if method == 'OPTIONS':
        return response(200, {})
    
    conn = get_db_connection()
    
    try:
        # Auth endpoints
        if endpoint == 'login':
            return handle_login(event, conn)
        elif endpoint == 'register':
            return handle_register(event, conn)
        elif endpoint == 'me':
            return handle_me(event, conn)
        
        # User management
        elif endpoint == 'users':
            return handle_users(method, event, conn)
        
        # API endpoints
        elif endpoint == 'payments':
            return handle_payments(method, event, conn)
        elif endpoint == 'categories':
            return handle_categories(method, event, conn)
        elif endpoint == 'stats':
            return handle_stats(event, conn)
        elif endpoint == 'legal-entities':
            return handle_legal_entities(method, event, conn)
        elif endpoint == 'custom-fields':
            return handle_custom_fields(method, event, conn)
        elif endpoint == 'contractors':
            return handle_contractors(method, event, conn)
        elif endpoint == 'customer_departments':
            return handle_customer_departments(method, event, conn)
        elif endpoint == 'roles':
            return handle_roles(method, event, conn)
        elif endpoint == 'permissions':
            return handle_permissions(method, event, conn)
        elif endpoint == 'approvals':
            return handle_approvals(method, event, conn)
        elif endpoint == 'services':
            return handle_services(method, event, conn)
        elif endpoint == 'comments':
            token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            if not token:
                return response(401, {'error': 'Authentication required'})
            payload = verify_jwt_token(token)
            if not payload:
                return response(401, {'error': 'Invalid token'})
            current_user = get_user_with_permissions(conn, payload['user_id'])
            if not current_user:
                return response(401, {'error': 'User not found'})
            return handle_comments(method, event, conn, current_user)
        elif endpoint == 'comment-likes':
            token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            if not token:
                return response(401, {'error': 'Authentication required'})
            payload = verify_jwt_token(token)
            if not payload:
                return response(401, {'error': 'Invalid token'})
            current_user = get_user_with_permissions(conn, payload['user_id'])
            if not current_user:
                return response(401, {'error': 'User not found'})
            return handle_comment_likes(method, event, conn, current_user)
        
        return response(404, {'error': 'Endpoint not found'})
    
    finally:
        conn.close()

# Auth handlers
def handle_login(event: Dict[str, Any], conn) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '').strip()
    password = body_data.get('password', '')
    
    if not username or not password:
        return response(400, {'error': 'Логин и пароль обязательны'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT id, email, username, password_hash, full_name, is_active
        FROM users
        WHERE username = %s
    """, (username,))
    
    user = cur.fetchone()
    cur.close()
    
    if not user:
        return response(401, {'error': 'Неверный логин или пароль'})
    
    if not user['is_active']:
        return response(403, {'error': 'Пользователь деактивирован'})
    
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return response(401, {'error': 'Неверный логин или пароль'})
    
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

def handle_register(event: Dict[str, Any], conn) -> Dict[str, Any]:
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
    
    body_data = json.loads(event.get('body', '{}'))
    username = body_data.get('username', '').strip()
    email = body_data.get('email', '').strip().lower()
    password = body_data.get('password', '')
    full_name = body_data.get('full_name', '').strip()
    role_id = body_data.get('role_id')
    
    if not username or not email or not password or not full_name:
        return response(400, {'error': 'Логин, email, пароль и имя обязательны'})
    
    if len(password) < 4:
        return response(400, {'error': 'Пароль должен быть не менее 4 символов'})
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            INSERT INTO users (username, email, password_hash, full_name, is_active)
            VALUES (%s, %s, %s, %s, true)
            RETURNING id, username, email, full_name, is_active, created_at
        """, (username, email, password_hash, full_name))
        
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
            'username': new_user['username'],
            'email': new_user['email'],
            'full_name': new_user['full_name'],
            'is_active': new_user['is_active'],
            'created_at': new_user['created_at']
        })
    except psycopg2.IntegrityError:
        conn.rollback()
        cur.close()
        return response(409, {'error': 'Пользователь с таким email уже существует'})

def handle_me(event: Dict[str, Any], conn) -> Dict[str, Any]:
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return response(401, {'error': 'Требуется авторизация'})
    
    payload = verify_jwt_token(token)
    if not payload:
        return response(401, {'error': 'Недействительный токен'})
    
    user_data = get_user_with_permissions(conn, payload['user_id'])
    if not user_data:
        return response(404, {'error': 'Пользователь не найден'})
    
    return response(200, user_data)

# User management handler
def handle_users(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    if method == 'GET':
        user_payload, error = verify_token_and_permission(event, conn, 'users.read')
        if error:
            return error
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT 
                u.id, u.username, u.email, u.full_name, u.is_active, 
                u.created_at, u.last_login,
                COALESCE(
                    array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL),
                    ARRAY[]::json[]
                ) as roles
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
            return response(400, {'error': 'Логин, email, пароль и имя обязательны'})
        
        if len(password) < 4:
            return response(400, {'error': 'Пароль должен быть не менее 4 символов'})
        
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
            
            cur.execute("""
                SELECT 
                    u.id, u.username, u.email, u.full_name, u.is_active, 
                    u.created_at, u.last_login,
                    COALESCE(
                        array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL),
                        ARRAY[]::json[]
                    ) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = %s
                GROUP BY u.id
            """, (new_user['id'],))
            
            created_user = cur.fetchone()
            cur.close()
            
            return response(201, dict(created_user))
        except psycopg2.IntegrityError as e:
            conn.rollback()
            cur.close()
            if 'username' in str(e):
                return response(409, {'error': 'Пользователь с таким логином уже существует'})
            return response(409, {'error': 'Пользователь с таким email уже существует'})
    
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
            cur.execute("""
                UPDATE users SET is_active = %s
                WHERE id = %s
                RETURNING id, username, email, full_name, is_active
            """, (body_data['is_active'], user_id))
            
            updated_user = cur.fetchone()
            conn.commit()
            cur.close()
            
            return response(200, dict(updated_user))
        
        username = body_data.get('username', '').strip()
        email = body_data.get('email', '').strip().lower()
        full_name = body_data.get('full_name', '').strip()
        password = body_data.get('password')
        role_ids = body_data.get('role_ids')
        
        if not username or not email or not full_name:
            return response(400, {'error': 'Логин, email и имя обязательны'})
        
        try:
            cur.execute("""
                UPDATE users 
                SET username = %s, email = %s, full_name = %s
                WHERE id = %s
            """, (username, email, full_name, user_id))
            
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
                SELECT 
                    u.id, u.username, u.email, u.full_name, u.is_active, 
                    u.created_at, u.last_login,
                    COALESCE(
                        array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL),
                        ARRAY[]::json[]
                    ) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = %s
                GROUP BY u.id
            """, (user_id,))
            
            updated_user = cur.fetchone()
            cur.close()
            
            return response(200, dict(updated_user))
            
        except psycopg2.IntegrityError as e:
            conn.rollback()
            cur.close()
            if 'username' in str(e):
                return response(409, {'error': 'Пользователь с таким логином уже существует'})
            return response(409, {'error': 'Пользователь с таким email уже существует'})
    
    elif method == 'DELETE':
        user_payload, error = verify_token_and_permission(event, conn, 'users.delete')
        if error:
            return error
        
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('id')
        
        if not user_id:
            return response(400, {'error': 'ID пользователя обязателен'})
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            cur.execute("DELETE FROM user_roles WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM users WHERE id = %s RETURNING id, username", (user_id,))
            deleted_user = cur.fetchone()
            
            if not deleted_user:
                cur.close()
                return response(404, {'error': 'Пользователь не найден'})
            
            conn.commit()
            cur.close()
            
            return response(200, {'message': 'Пользователь удалён', 'id': deleted_user['id']})
        except Exception as e:
            conn.rollback()
            cur.close()
            return response(500, {'error': f'Ошибка при удалении: {str(e)}'})
    
    return response(405, {'error': 'Метод не поддерживается'})

# API handlers (simplified for context - keeping core logic)
def handle_categories(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'categories.read')
            if error:
                return error
            
            cur.execute('SELECT id, name, icon, created_at FROM categories ORDER BY name')
            rows = cur.fetchall()
            categories = [
                {
                    'id': row[0],
                    'name': row[1],
                    'icon': row[2],
                    'created_at': row[3].isoformat() if row[3] else None
                }
                for row in rows
            ]
            return response(200, categories)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'categories.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            cat_req = CategoryRequest(**body)
            
            cur.execute(
                "INSERT INTO categories (name, icon) VALUES (%s, %s) RETURNING id, name, icon, created_at",
                (cat_req.name, cat_req.icon)
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'icon': row[2],
                'created_at': row[3].isoformat() if row[3] else None
            })
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            category_id = body.get('id')
            cat_req = CategoryRequest(**body)
            
            if not category_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(
                "UPDATE categories SET name = %s, icon = %s WHERE id = %s RETURNING id, name, icon, created_at",
                (cat_req.name, cat_req.icon, category_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Category not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'icon': row[2],
                'created_at': row[3].isoformat() if row[3] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'categories.delete')
            if error:
                return error
            
            params = event.get('queryStringParameters', {})
            category_id = params.get('id')
            
            if not category_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute('SELECT COUNT(*) FROM payments WHERE category_id = %s', (category_id,))
            count = cur.fetchone()[0]
            
            if count > 0:
                return response(400, {'error': 'Cannot delete category with existing payments'})
            
            cur.execute('DELETE FROM categories WHERE id = %s', (category_id,))
            conn.commit()
            
            return response(200, {'success': True})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_payments(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'payments.read')
            if error:
                return error
            
            cur.execute(f"""
                SELECT 
                    p.id, 
                    p.category_id,
                    c.name as category_name,
                    c.icon as category_icon,
                    p.amount, 
                    p.description, 
                    p.payment_date,
                    p.created_at,
                    p.legal_entity_id,
                    le.name as legal_entity_name,
                    p.contractor_id,
                    ct.name as contractor_name,
                    p.department_id,
                    cd.name as department_name,
                    p.status,
                    p.created_by,
                    u.username as created_by_name,
                    p.submitted_at,
                    p.tech_director_approved_at,
                    p.tech_director_approved_by,
                    p.ceo_approved_at,
                    p.ceo_approved_by,
                    p.service_id,
                    s.name as service_name,
                    p.invoice_number,
                    p.invoice_date
                FROM {SCHEMA}.payments p
                LEFT JOIN {SCHEMA}.categories c ON p.category_id = c.id
                LEFT JOIN {SCHEMA}.legal_entities le ON p.legal_entity_id = le.id
                LEFT JOIN {SCHEMA}.contractors ct ON p.contractor_id = ct.id
                LEFT JOIN {SCHEMA}.customer_departments cd ON p.department_id = cd.id
                LEFT JOIN {SCHEMA}.users u ON p.created_by = u.id
                LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
                ORDER BY p.payment_date DESC
            """)
            rows = cur.fetchall()
            payments = [
                {
                    'id': row[0],
                    'category_id': row[1],
                    'category_name': row[2],
                    'category_icon': row[3],
                    'amount': float(row[4]),
                    'description': row[5],
                    'payment_date': row[6].isoformat() if row[6] else None,
                    'created_at': row[7].isoformat() if row[7] else None,
                    'legal_entity_id': row[8],
                    'legal_entity_name': row[9],
                    'contractor_id': row[10],
                    'contractor_name': row[11],
                    'department_id': row[12],
                    'department_name': row[13],
                    'status': row[14],
                    'created_by': row[15],
                    'created_by_name': row[16],
                    'submitted_at': row[17].isoformat() if row[17] else None,
                    'tech_director_approved_at': row[18].isoformat() if row[18] else None,
                    'tech_director_approved_by': row[19],
                    'ceo_approved_at': row[20].isoformat() if row[20] else None,
                    'ceo_approved_by': row[21],
                    'service_id': row[22],
                    'service_name': row[23],
                    'invoice_number': row[24],
                    'invoice_date': row[25].isoformat() if row[25] else None
                }
                for row in rows
            ]
            return response(200, payments)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'payments.create')
            if error:
                return error
            
            try:
                body = json.loads(event.get('body', '{}'))
                pay_req = PaymentRequest(**body)
            except Exception as e:
                return response(400, {'error': f'Validation error: {str(e)}'})
            
            payment_date = pay_req.payment_date if pay_req.payment_date else datetime.now().isoformat()
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            try:
                cur.execute(
                    f"""SELECT name FROM {SCHEMA}.categories WHERE id = %s""",
                    (pay_req.category_id,)
                )
                category = cur.fetchone()
                if not category:
                    cur.close()
                    return response(400, {'error': 'Category not found'})
                
                category_name = category['name']
                
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.payments (category, category_id, amount, description, payment_date, legal_entity_id, contractor_id, department_id, service_id, invoice_number, invoice_date, created_by, status) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'draft') 
                       RETURNING id, category_id, amount, description, payment_date, created_at, legal_entity_id, contractor_id, department_id, service_id, invoice_number, invoice_date, status, created_by""",
                    (category_name, pay_req.category_id, pay_req.amount, pay_req.description, payment_date, 
                     pay_req.legal_entity_id, pay_req.contractor_id, pay_req.department_id, pay_req.service_id, 
                     pay_req.invoice_number, pay_req.invoice_date, payload['user_id'])
                )
                row = cur.fetchone()
                conn.commit()
                cur.close()
                
                return response(201, {
                    'id': row['id'],
                    'category_id': row['category_id'],
                    'amount': float(row['amount']),
                    'description': row['description'],
                    'payment_date': row['payment_date'].isoformat() if row['payment_date'] else None,
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                    'legal_entity_id': row['legal_entity_id'],
                    'contractor_id': row['contractor_id'],
                    'department_id': row['department_id'],
                    'service_id': row['service_id'],
                    'invoice_number': row['invoice_number'],
                    'invoice_date': row['invoice_date'].isoformat() if row['invoice_date'] else None,
                    'status': row['status'],
                    'created_by': row['created_by']
                })
            except Exception as e:
                import traceback
                error_details = traceback.format_exc()
                print(f"Payment creation error: {str(e)}")
                print(f"Full traceback: {error_details}")
                conn.rollback()
                cur.close()
                return response(500, {'error': f'Database error: {str(e)}', 'details': error_details})
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'payments.update')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            payment_id = body.get('id')
            
            if not payment_id:
                return response(400, {'error': 'ID is required'})
            
            pay_req = PaymentRequest(**body)
            
            cur.execute(
                """UPDATE payments 
                   SET category_id = %s, amount = %s, description = %s, payment_date = %s, 
                       legal_entity_id = %s, contractor_id = %s, department_id = %s
                   WHERE id = %s 
                   RETURNING id, category_id, amount, description, payment_date, created_at, legal_entity_id, contractor_id, department_id""",
                (pay_req.category_id, pay_req.amount, pay_req.description, pay_req.payment_date,
                 pay_req.legal_entity_id, pay_req.contractor_id, pay_req.department_id, payment_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Payment not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'category_id': row[1],
                'amount': float(row[2]),
                'description': row[3],
                'payment_date': row[4].isoformat() if row[4] else None,
                'created_at': row[5].isoformat() if row[5] else None,
                'legal_entity_id': row[6],
                'contractor_id': row[7],
                'department_id': row[8]
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'payments.delete')
            if error:
                return error
            
            params = event.get('queryStringParameters', {})
            payment_id = params.get('id')
            
            if not payment_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute('DELETE FROM payments WHERE id = %s', (payment_id,))
            conn.commit()
            
            return response(200, {'success': True})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_stats(method: str, conn) -> Dict[str, Any]:
    if method != 'GET':
        return response(405, {'error': 'Method not allowed'})
    
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT 
                c.id,
                c.name,
                c.icon,
                COALESCE(SUM(p.amount), 0) as total
            FROM categories c
            LEFT JOIN payments p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.icon
            ORDER BY total DESC
        """)
        
        rows = cur.fetchall()
        stats = [
            {
                'id': row[0],
                'name': row[1],
                'icon': row[2],
                'total': float(row[3])
            }
            for row in rows
        ]
        
        cur.execute('SELECT COALESCE(SUM(amount), 0) as grand_total FROM payments')
        grand_total = float(cur.fetchone()[0])
        
        return response(200, {
            'categories': stats,
            'grand_total': grand_total
        })
    
    finally:
        cur.close()

def handle_legal_entities(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'legal_entities.read')
            if error:
                return error
            
            cur.execute('SELECT id, name, inn, kpp, address, created_at FROM legal_entities ORDER BY name')
            rows = cur.fetchall()
            entities = [
                {
                    'id': row[0],
                    'name': row[1],
                    'inn': row[2] or '',
                    'kpp': row[3] or '',
                    'address': row[4] or '',
                    'created_at': row[5].isoformat() if row[5] else None
                }
                for row in rows
            ]
            return response(200, entities)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'legal_entities.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            entity_req = LegalEntityRequest(**body)
            
            cur.execute(
                "INSERT INTO legal_entities (name, inn, kpp, address) VALUES (%s, %s, %s, %s) RETURNING id, name, inn, kpp, address, created_at",
                (entity_req.name, entity_req.inn, entity_req.kpp, entity_req.address)
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'inn': row[2] or '',
                'kpp': row[3] or '',
                'address': row[4] or '',
                'created_at': row[5].isoformat() if row[5] else None
            })
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'legal_entities.update')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            entity_id = body.get('id')
            entity_req = LegalEntityRequest(**body)
            
            if not entity_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(
                "UPDATE legal_entities SET name = %s, inn = %s, kpp = %s, address = %s WHERE id = %s RETURNING id, name, inn, kpp, address, created_at",
                (entity_req.name, entity_req.inn, entity_req.kpp, entity_req.address, entity_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Legal entity not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'inn': row[2] or '',
                'kpp': row[3] or '',
                'address': row[4] or '',
                'created_at': row[5].isoformat() if row[5] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'legal_entities.delete')
            if error:
                return error
            
            body_data = json.loads(event.get('body', '{}'))
            entity_id = body_data.get('id')
            
            cur.execute("DELETE FROM legal_entities WHERE id = %s RETURNING id", (entity_id,))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Legal entity not found'})
            
            conn.commit()
            return response(200, {'message': 'Legal entity deleted'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_custom_fields(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'custom_fields.read')
            if error:
                return error
            
            cur.execute('SELECT id, name, field_type, options, created_at FROM custom_fields ORDER BY created_at DESC')
            rows = cur.fetchall()
            fields = [
                {
                    'id': row[0],
                    'name': row[1],
                    'field_type': row[2],
                    'options': row[3] or '',
                    'created_at': row[4].isoformat() if row[4] else None
                }
                for row in rows
            ]
            return response(200, fields)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'custom_fields.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            field_req = CustomFieldRequest(**body)
            
            cur.execute(
                "INSERT INTO custom_fields (name, field_type, options) VALUES (%s, %s, %s) RETURNING id, name, field_type, options, created_at",
                (field_req.name, field_req.field_type, field_req.options)
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'field_type': row[2],
                'options': row[3] or '',
                'created_at': row[4].isoformat() if row[4] else None
            })
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'custom_fields.update')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            field_id = body.get('id')
            field_req = CustomFieldRequest(**body)
            
            if not field_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(
                "UPDATE custom_fields SET name = %s, field_type = %s, options = %s WHERE id = %s RETURNING id, name, field_type, options, created_at",
                (field_req.name, field_req.field_type, field_req.options, field_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Custom field not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'field_type': row[2],
                'options': row[3] or '',
                'created_at': row[4].isoformat() if row[4] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'custom_fields.delete')
            if error:
                return error
            
            body_data = json.loads(event.get('body', '{}'))
            field_id = body_data.get('id')
            
            cur.execute("DELETE FROM custom_fields WHERE id = %s RETURNING id", (field_id,))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Custom field not found'})
            
            conn.commit()
            return response(200, {'message': 'Custom field deleted'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_contractors(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'contractors.read')
            if error:
                return error
            
            cur.execute('''SELECT id, name, inn, kpp, ogrn, legal_address, actual_address, phone, email, 
                          contact_person, bank_name, bank_bik, bank_account, correspondent_account, notes, created_at 
                          FROM contractors ORDER BY name''')
            rows = cur.fetchall()
            contractors = [
                {
                    'id': row[0],
                    'name': row[1],
                    'inn': row[2] or '',
                    'kpp': row[3] or '',
                    'ogrn': row[4] or '',
                    'legal_address': row[5] or '',
                    'actual_address': row[6] or '',
                    'phone': row[7] or '',
                    'email': row[8] or '',
                    'contact_person': row[9] or '',
                    'bank_name': row[10] or '',
                    'bank_bik': row[11] or '',
                    'bank_account': row[12] or '',
                    'correspondent_account': row[13] or '',
                    'notes': row[14] or '',
                    'created_at': row[15].isoformat() if row[15] else None
                }
                for row in rows
            ]
            return response(200, contractors)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'contractors.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            cont_req = ContractorRequest(**body)
            
            cur.execute(
                """INSERT INTO contractors (name, inn, kpp, ogrn, legal_address, actual_address, phone, email, 
                   contact_person, bank_name, bank_bik, bank_account, correspondent_account, notes) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
                   RETURNING id, name, inn, kpp, ogrn, legal_address, actual_address, phone, email, 
                   contact_person, bank_name, bank_bik, bank_account, correspondent_account, notes, created_at""",
                (cont_req.name, cont_req.inn, cont_req.kpp, cont_req.ogrn, cont_req.legal_address,
                 cont_req.actual_address, cont_req.phone, cont_req.email, cont_req.contact_person,
                 cont_req.bank_name, cont_req.bank_bik, cont_req.bank_account, cont_req.correspondent_account, cont_req.notes)
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'inn': row[2] or '',
                'kpp': row[3] or '',
                'ogrn': row[4] or '',
                'legal_address': row[5] or '',
                'actual_address': row[6] or '',
                'phone': row[7] or '',
                'email': row[8] or '',
                'contact_person': row[9] or '',
                'bank_name': row[10] or '',
                'bank_bik': row[11] or '',
                'bank_account': row[12] or '',
                'correspondent_account': row[13] or '',
                'notes': row[14] or '',
                'created_at': row[15].isoformat() if row[15] else None
            })
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'contractors.update')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            contractor_id = body.get('id')
            cont_req = ContractorRequest(**body)
            
            if not contractor_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(
                """UPDATE contractors SET name = %s, inn = %s, kpp = %s, ogrn = %s, legal_address = %s, 
                   actual_address = %s, phone = %s, email = %s, contact_person = %s, bank_name = %s, 
                   bank_bik = %s, bank_account = %s, correspondent_account = %s, notes = %s 
                   WHERE id = %s 
                   RETURNING id, name, inn, kpp, ogrn, legal_address, actual_address, phone, email, 
                   contact_person, bank_name, bank_bik, bank_account, correspondent_account, notes, created_at""",
                (cont_req.name, cont_req.inn, cont_req.kpp, cont_req.ogrn, cont_req.legal_address,
                 cont_req.actual_address, cont_req.phone, cont_req.email, cont_req.contact_person,
                 cont_req.bank_name, cont_req.bank_bik, cont_req.bank_account, cont_req.correspondent_account,
                 cont_req.notes, contractor_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Contractor not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'inn': row[2] or '',
                'kpp': row[3] or '',
                'ogrn': row[4] or '',
                'legal_address': row[5] or '',
                'actual_address': row[6] or '',
                'phone': row[7] or '',
                'email': row[8] or '',
                'contact_person': row[9] or '',
                'bank_name': row[10] or '',
                'bank_bik': row[11] or '',
                'bank_account': row[12] or '',
                'correspondent_account': row[13] or '',
                'notes': row[14] or '',
                'created_at': row[15].isoformat() if row[15] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'contractors.delete')
            if error:
                return error
            
            body_data = json.loads(event.get('body', '{}'))
            contractor_id = body_data.get('id')
            
            cur.execute("DELETE FROM contractors WHERE id = %s RETURNING id", (contractor_id,))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Contractor not found'})
            
            conn.commit()
            return response(200, {'message': 'Contractor deleted'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_roles(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'roles.read')
            if error:
                return error
            
            params = event.get('queryStringParameters') or {}
            role_id = params.get('id')
            
            if role_id:
                cur.execute(
                    f'SELECT id, name, description, created_at FROM {SCHEMA}.roles WHERE id = %s',
                    (role_id,)
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Role not found'})
                
                cur.execute(
                    f'''SELECT p.id, p.name, p.resource, p.action, p.description 
                       FROM {SCHEMA}.permissions p 
                       JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id 
                       WHERE rp.role_id = %s''',
                    (role_id,)
                )
                perm_rows = cur.fetchall()
                
                return response(200, {
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'created_at': row[3].isoformat() if row[3] else None,
                    'permissions': [{
                        'id': pr[0],
                        'name': pr[1],
                        'resource': pr[2],
                        'action': pr[3],
                        'description': pr[4]
                    } for pr in perm_rows]
                })
            
            cur.execute(f'SELECT id, name, description, created_at FROM {SCHEMA}.roles ORDER BY id')
            rows = cur.fetchall()
            result = []
            for row in rows:
                cur.execute(
                    f'''SELECT p.id, p.name, p.resource, p.action, p.description 
                       FROM {SCHEMA}.permissions p 
                       JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id 
                       WHERE rp.role_id = %s''',
                    (row[0],)
                )
                perm_rows = cur.fetchall()
                
                cur.execute(f'SELECT COUNT(*) FROM {SCHEMA}.user_roles WHERE role_id = %s', (row[0],))
                user_count = cur.fetchone()[0]
                
                result.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'created_at': row[3].isoformat() if row[3] else None,
                    'user_count': user_count,
                    'permissions': [{
                        'id': pr[0],
                        'name': pr[1],
                        'resource': pr[2],
                        'action': pr[3],
                        'description': pr[4]
                    } for pr in perm_rows]
                })
            return response(200, result)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'roles.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            role_req = RoleRequest(**body)
            
            cur.execute(
                f"INSERT INTO {SCHEMA}.roles (name, description) VALUES (%s, %s) RETURNING id, name, description, created_at",
                (role_req.name, role_req.description)
            )
            row = cur.fetchone()
            role_id = row[0]
            
            for perm_id in role_req.permission_ids:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.role_permissions (role_id, permission_id) VALUES (%s, %s)",
                    (role_id, perm_id)
                )
            
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'created_at': row[3].isoformat() if row[3] else None
            })
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'roles.update')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            role_id = body.get('id')
            role_req = RoleRequest(**body)
            
            if not role_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(
                f"UPDATE {SCHEMA}.roles SET name = %s, description = %s WHERE id = %s RETURNING id, name, description, created_at",
                (role_req.name, role_req.description, role_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Role not found'})
            
            cur.execute(f"DELETE FROM {SCHEMA}.role_permissions WHERE role_id = %s", (role_id,))
            
            for perm_id in role_req.permission_ids:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.role_permissions (role_id, permission_id) VALUES (%s, %s)",
                    (role_id, perm_id)
                )
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'created_at': row[3].isoformat() if row[3] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'roles.delete')
            if error:
                return error
            
            body_data = json.loads(event.get('body', '{}'))
            role_id = body_data.get('id')
            
            if not role_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(f'SELECT COUNT(*) FROM {SCHEMA}.user_roles WHERE role_id = %s', (role_id,))
            user_count = cur.fetchone()[0]
            
            if user_count > 0:
                return response(400, {'error': 'Cannot delete role with assigned users'})
            
            cur.execute(f"DELETE FROM {SCHEMA}.role_permissions WHERE role_id = %s", (role_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.roles WHERE id = %s RETURNING id", (role_id,))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Role not found'})
            
            conn.commit()
            return response(200, {'message': 'Role deleted'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_permissions(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'permissions.read')
            if error:
                return error
            
            cur.execute(f'SELECT id, name, resource, action, description, created_at FROM {SCHEMA}.permissions ORDER BY resource, action')
            rows = cur.fetchall()
            permissions = [
                {
                    'id': row[0],
                    'name': row[1],
                    'resource': row[2],
                    'action': row[3],
                    'description': row[4] or '',
                    'created_at': row[5].isoformat() if row[5] else None
                }
                for row in rows
            ]
            return response(200, permissions)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'permissions.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            perm_req = PermissionRequest(**body)
            
            cur.execute(
                f"INSERT INTO {SCHEMA}.permissions (name, resource, action, description) VALUES (%s, %s, %s, %s) RETURNING id, name, resource, action, description, created_at",
                (perm_req.name, perm_req.resource, perm_req.action, perm_req.description)
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'resource': row[2],
                'action': row[3],
                'description': row[4] or '',
                'created_at': row[5].isoformat() if row[5] else None
            })
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'permissions.update')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            perm_id = body.get('id')
            perm_req = PermissionRequest(**body)
            
            if not perm_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(
                f"UPDATE {SCHEMA}.permissions SET name = %s, resource = %s, action = %s, description = %s WHERE id = %s RETURNING id, name, resource, action, description, created_at",
                (perm_req.name, perm_req.resource, perm_req.action, perm_req.description, perm_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Permission not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'resource': row[2],
                'action': row[3],
                'description': row[4] or '',
                'created_at': row[5].isoformat() if row[5] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'permissions.delete')
            if error:
                return error
            
            body_data = json.loads(event.get('body', '{}'))
            perm_id = body_data.get('id')
            
            if not perm_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(f"DELETE FROM {SCHEMA}.role_permissions WHERE permission_id = %s", (perm_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.permissions WHERE id = %s RETURNING id", (perm_id,))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Permission not found'})
            
            conn.commit()
            return response(200, {'message': 'Permission deleted'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_customer_departments(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'customer_departments.read')
            if error:
                return error
            
            cur.execute('SELECT id, name, description, is_active, created_at FROM customer_departments WHERE is_active = true ORDER BY name')
            rows = cur.fetchall()
            departments = [
                {
                    'id': row[0],
                    'name': row[1],
                    'description': row[2] or '',
                    'is_active': row[3],
                    'created_at': row[4].isoformat() if row[4] else None
                }
                for row in rows
            ]
            return response(200, departments)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'customer_departments.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            dept_req = CustomerDepartmentRequest(**body)
            
            cur.execute(
                "INSERT INTO customer_departments (name, description) VALUES (%s, %s) RETURNING id, name, description, is_active, created_at",
                (dept_req.name, dept_req.description)
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'description': row[2] or '',
                'is_active': row[3],
                'created_at': row[4].isoformat() if row[4] else None
            })
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'customer_departments.update')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            dept_id = body.get('id')
            dept_req = CustomerDepartmentRequest(**body)
            
            if not dept_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(
                "UPDATE customer_departments SET name = %s, description = %s WHERE id = %s RETURNING id, name, description, is_active, created_at",
                (dept_req.name, dept_req.description, dept_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Department not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'description': row[2] or '',
                'is_active': row[3],
                'created_at': row[4].isoformat() if row[4] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'customer_departments.delete')
            if error:
                return error
            
            body_data = json.loads(event.get('body', '{}'))
            dept_id = body_data.get('id')
            
            cur.execute("DELETE FROM customer_departments WHERE id = %s RETURNING id", (dept_id,))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Department not found'})
            
            conn.commit()
            return response(200, {'message': 'Department deleted'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_approvals(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    payload = verify_token(event)
    if not payload:
        return response(401, {'error': 'Требуется авторизация'})
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        payment_id = body_data.get('payment_id')
        
        if not payment_id:
            return response(400, {'error': 'payment_id обязателен'})
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(f"""
            SELECT p.status, p.created_by, p.service_id, 
                   s.intermediate_approver_id, s.final_approver_id
            FROM {SCHEMA}.payments p
            LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
            WHERE p.id = %s
        """, (payment_id,))
        
        payment = cur.fetchone()
        if not payment:
            cur.close()
            return response(404, {'error': 'Платеж не найден'})
        
        if payment['status'] != 'draft':
            cur.close()
            return response(400, {'error': 'Платеж уже отправлен на согласование'})
        
        if not payment['service_id']:
            cur.close()
            return response(400, {'error': 'Для отправки на согласование необходимо указать сервис'})
        
        cur.execute(f"""
            UPDATE {SCHEMA}.payments 
            SET status = 'pending_tech_director', submitted_at = NOW()
            WHERE id = %s
        """, (payment_id,))
        
        cur.execute(f"""
            INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment)
            VALUES (%s, %s, 'creator', 'submitted', 'Отправлено на согласование')
        """, (payment_id, payload['user_id']))
        
        conn.commit()
        cur.close()
        
        return response(200, {'message': 'Платеж отправлен на согласование', 'status': 'pending_tech_director'})
    
    elif method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        
        req = ApprovalActionRequest(**body_data)
        user_id = payload['user_id']
        user_role = get_user_role(conn, user_id)
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(f"""
            SELECT p.status, p.service_id, 
                   s.intermediate_approver_id, s.final_approver_id
            FROM {SCHEMA}.payments p
            LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
            WHERE p.id = %s
        """, (req.payment_id,))
        
        payment = cur.fetchone()
        if not payment:
            cur.close()
            return response(404, {'error': 'Платеж не найден'})
        
        current_status = payment['status']
        intermediate_approver = payment.get('intermediate_approver_id')
        final_approver = payment.get('final_approver_id')
        
        if current_status == 'pending_tech_director' and user_id == intermediate_approver:
            if req.action == 'approve':
                new_status = 'pending_ceo'
                cur.execute(f"""
                    UPDATE {SCHEMA}.payments 
                    SET status = %s, tech_director_approved_at = NOW(), tech_director_approved_by = %s
                    WHERE id = %s
                """, (new_status, user_id, req.payment_id))
            else:
                new_status = 'rejected'
                cur.execute(f"""
                    UPDATE {SCHEMA}.payments 
                    SET status = %s, tech_director_approved_at = NOW(), tech_director_approved_by = %s
                    WHERE id = %s
                """, (new_status, user_id, req.payment_id))
        
        elif current_status == 'pending_ceo' and user_id == final_approver:
            if req.action == 'approve':
                new_status = 'approved'
                cur.execute(f"""
                    UPDATE {SCHEMA}.payments 
                    SET status = %s, ceo_approved_at = NOW(), ceo_approved_by = %s
                    WHERE id = %s
                """, (new_status, user_id, req.payment_id))
            else:
                new_status = 'rejected'
                cur.execute(f"""
                    UPDATE {SCHEMA}.payments 
                    SET status = %s, ceo_approved_at = NOW(), ceo_approved_by = %s
                    WHERE id = %s
                """, (new_status, user_id, req.payment_id))
        
        else:
            cur.close()
            return response(403, {'error': 'У вас нет прав для этого действия'})
        
        cur.execute(f"""
            INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment)
            VALUES (%s, %s, %s, %s, %s)
        """, (req.payment_id, user_id, user_role, req.action, req.comment))
        
        conn.commit()
        cur.close()
        
        return response(200, {'message': 'Решение принято', 'status': new_status})
    
    elif method == 'GET':
        params = event.get('queryStringParameters') or {}
        payment_id = params.get('payment_id')
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if payment_id:
            cur.execute(f"""
                SELECT a.*, u.full_name as approver_name
                FROM {SCHEMA}.approvals a
                JOIN {SCHEMA}.users u ON a.approver_id = u.id
                WHERE a.payment_id = %s
                ORDER BY a.created_at DESC
            """, (payment_id,))
        else:
            cur.execute(f"""
                SELECT a.*, u.full_name as approver_name, p.amount, p.description
                FROM {SCHEMA}.approvals a
                JOIN {SCHEMA}.users u ON a.approver_id = u.id
                JOIN {SCHEMA}.payments p ON a.payment_id = p.id
                ORDER BY a.created_at DESC
                LIMIT 100
            """)
        
        approvals = [dict(row) for row in cur.fetchall()]
        cur.close()
        
        return response(200, approvals)
    
    return response(405, {'error': 'Метод не поддерживается'})

def handle_services(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            payload, error = verify_token_and_permission(event, conn, 'services.read')
            if error:
                return error
            
            cur.execute(f"""
                SELECT 
                    s.id, s.name, s.description, 
                    s.intermediate_approver_id, s.final_approver_id,
                    s.created_at, s.updated_at,
                    u1.full_name as intermediate_approver_name,
                    u2.full_name as final_approver_name
                FROM {SCHEMA}.services s
                LEFT JOIN {SCHEMA}.users u1 ON s.intermediate_approver_id = u1.id
                LEFT JOIN {SCHEMA}.users u2 ON s.final_approver_id = u2.id
                ORDER BY s.created_at DESC
            """)
            rows = cur.fetchall()
            services = [dict(row) for row in rows]
            return response(200, {'services': services})
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'services.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            service_req = ServiceRequest(**body)
            
            cur.execute(
                f"""INSERT INTO {SCHEMA}.services 
                   (name, description, intermediate_approver_id, final_approver_id, created_at, updated_at) 
                   VALUES (%s, %s, %s, %s, NOW(), NOW()) 
                   RETURNING id, name, description, intermediate_approver_id, final_approver_id, created_at""",
                (service_req.name, service_req.description, 
                 service_req.intermediate_approver_id, service_req.final_approver_id)
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'intermediate_approver_id': row['intermediate_approver_id'],
                'final_approver_id': row['final_approver_id'],
                'created_at': row['created_at'].isoformat() if row['created_at'] else None
            })
        
        elif method == 'PUT':
            payload, error = verify_token_and_permission(event, conn, 'services.update')
            if error:
                return error
            
            params = event.get('queryStringParameters') or {}
            service_id = params.get('id')
            
            if not service_id:
                return response(400, {'error': 'ID is required'})
            
            body = json.loads(event.get('body', '{}'))
            service_req = ServiceRequest(**body)
            
            cur.execute(
                f"""UPDATE {SCHEMA}.services 
                   SET name = %s, description = %s, 
                       intermediate_approver_id = %s, final_approver_id = %s,
                       updated_at = NOW()
                   WHERE id = %s 
                   RETURNING id, name, description, intermediate_approver_id, final_approver_id, updated_at""",
                (service_req.name, service_req.description,
                 service_req.intermediate_approver_id, service_req.final_approver_id, service_id)
            )
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Service not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'intermediate_approver_id': row['intermediate_approver_id'],
                'final_approver_id': row['final_approver_id'],
                'updated_at': row['updated_at'].isoformat() if row['updated_at'] else None
            })
        
        elif method == 'DELETE':
            payload, error = verify_token_and_permission(event, conn, 'services.delete')
            if error:
                return error
            
            params = event.get('queryStringParameters') or {}
            service_id = params.get('id')
            
            if not service_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute(f"DELETE FROM {SCHEMA}.services WHERE id = %s RETURNING id", (service_id,))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Service not found'})
            
            conn.commit()
            return response(200, {'message': 'Service deleted'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()

def handle_stats(event: Dict[str, Any], conn) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method != 'GET':
        return response(405, {'error': 'Метод не разрешен'})
    
    payload = verify_token(event)
    if not payload:
        return response(401, {'error': 'Требуется авторизация'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(f"""
            SELECT 
                COUNT(*) as total_payments,
                COALESCE(SUM(amount), 0) as total_amount,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
            FROM {SCHEMA}.payments
        """)
        
        stats_data = dict(cur.fetchone())
        
        cur.execute(f"""
            SELECT 
                c.id,
                c.name,
                c.icon,
                COUNT(p.id) as payment_count,
                COALESCE(SUM(p.amount), 0) as total_amount
            FROM {SCHEMA}.categories c
            LEFT JOIN {SCHEMA}.payments p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.icon
            ORDER BY total_amount DESC
        """)
        
        category_stats = [dict(row) for row in cur.fetchall()]
        
        cur.execute(f"""
            SELECT 
                d.id,
                d.name,
                d.description,
                COUNT(p.id) as payment_count,
                COALESCE(SUM(p.amount), 0) as total_amount
            FROM {SCHEMA}.customer_departments d
            LEFT JOIN {SCHEMA}.payments p ON d.id = p.department_id
            GROUP BY d.id, d.name, d.description
            ORDER BY total_amount DESC
        """)
        
        department_stats = [dict(row) for row in cur.fetchall()]
        
        cur.close()
        
        return response(200, {
            'stats': {
                'total_payments': stats_data['total_payments'],
                'total_amount': float(stats_data['total_amount']),
                'pending_count': stats_data['pending_count'],
                'approved_count': stats_data['approved_count'],
                'rejected_count': stats_data['rejected_count']
            },
            'category_stats': [{
                'id': c['id'],
                'name': c['name'],
                'icon': c['icon'],
                'payment_count': c['payment_count'],
                'total_amount': float(c['total_amount'])
            } for c in category_stats],
            'department_stats': [{
                'id': d['id'],
                'name': d['name'],
                'description': d['description'],
                'payment_count': d['payment_count'],
                'total_amount': float(d['total_amount'])
            } for d in department_stats]
        })
        
    except Exception as e:
        cur.close()
        return response(500, {'error': str(e)})

# Comments handlers
def handle_comments(method: str, event: Dict[str, Any], conn, current_user: Dict[str, Any]) -> Dict[str, Any]:
    if method == 'GET':
        payment_id = event.get('queryStringParameters', {}).get('payment_id')
        if not payment_id:
            return response(400, {'error': 'payment_id is required'})
        
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute(f"""
                SELECT 
                    c.id,
                    c.payment_id,
                    c.user_id,
                    u.username,
                    u.full_name,
                    c.parent_comment_id,
                    c.comment_text,
                    c.created_at,
                    c.updated_at,
                    (SELECT COUNT(*) FROM {SCHEMA}.comment_likes WHERE comment_id = c.id) as likes_count,
                    EXISTS(SELECT 1 FROM {SCHEMA}.comment_likes WHERE comment_id = c.id AND user_id = %s) as user_liked
                FROM {SCHEMA}.payment_comments c
                JOIN {SCHEMA}.users u ON c.user_id = u.id
                WHERE c.payment_id = %s
                ORDER BY c.created_at ASC
            """, (current_user['id'], int(payment_id)))
            
            comments = cur.fetchall()
            cur.close()
            
            return response(200, [dict(c) for c in comments])
        except Exception as e:
            if cur:
                cur.close()
            return response(500, {'error': str(e)})
    
    elif method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            payment_id = body.get('payment_id')
            comment_text = body.get('comment_text', '').strip()
            parent_comment_id = body.get('parent_comment_id')
            
            if not payment_id or not comment_text:
                return response(400, {'error': 'payment_id and comment_text are required'})
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute(f"""
                INSERT INTO {SCHEMA}.payment_comments 
                (payment_id, user_id, parent_comment_id, comment_text)
                VALUES (%s, %s, %s, %s)
                RETURNING id, payment_id, user_id, parent_comment_id, comment_text, created_at
            """, (payment_id, current_user['id'], parent_comment_id, comment_text))
            
            new_comment = cur.fetchone()
            conn.commit()
            cur.close()
            
            return response(201, dict(new_comment))
        except Exception as e:
            conn.rollback()
            if cur:
                cur.close()
            return response(500, {'error': str(e)})
    
    return response(405, {'error': 'Method not allowed'})

def handle_comment_likes(method: str, event: Dict[str, Any], conn, current_user: Dict[str, Any]) -> Dict[str, Any]:
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            comment_id = body.get('comment_id')
            
            if not comment_id:
                return response(400, {'error': 'comment_id is required'})
            
            cur = conn.cursor()
            
            cur.execute(f"""
                INSERT INTO {SCHEMA}.comment_likes (comment_id, user_id)
                VALUES (%s, %s)
                ON CONFLICT (comment_id, user_id) DO NOTHING
            """, (comment_id, current_user['id']))
            
            conn.commit()
            cur.close()
            
            return response(200, {'success': True})
        except Exception as e:
            conn.rollback()
            if cur:
                cur.close()
            return response(500, {'error': str(e)})
    
    elif method == 'DELETE':
        try:
            body = json.loads(event.get('body', '{}'))
            comment_id = body.get('comment_id')
            
            if not comment_id:
                return response(400, {'error': 'comment_id is required'})
            
            cur = conn.cursor()
            
            cur.execute(f"""
                DELETE FROM {SCHEMA}.comment_likes
                WHERE comment_id = %s AND user_id = %s
            """, (comment_id, current_user['id']))
            
            conn.commit()
            cur.close()
            
            return response(200, {'success': True})
        except Exception as e:
            conn.rollback()
            if cur:
                cur.close()
            return response(500, {'error': str(e)})
    
    return response(405, {'error': 'Method not allowed'})