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
            return handle_stats(method, conn)
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
            cur.close()
            
            return response(201, dict(new_user))
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
                    array_agg(json_build_object('id', r.id, 'name', r.name)) FILTER (WHERE r.id IS NOT NULL) as roles
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
                    p.submitted_at,
                    p.tech_director_approved_at,
                    p.tech_director_approved_by,
                    p.ceo_approved_at,
                    p.ceo_approved_by
                FROM {SCHEMA}.payments p
                LEFT JOIN {SCHEMA}.categories c ON p.category_id = c.id
                LEFT JOIN {SCHEMA}.legal_entities le ON p.legal_entity_id = le.id
                LEFT JOIN {SCHEMA}.contractors ct ON p.contractor_id = ct.id
                LEFT JOIN {SCHEMA}.customer_departments cd ON p.department_id = cd.id
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
                    'department_name': row[13]
                }
                for row in rows
            ]
            return response(200, payments)
        
        elif method == 'POST':
            payload, error = verify_token_and_permission(event, conn, 'payments.create')
            if error:
                return error
            
            body = json.loads(event.get('body', '{}'))
            pay_req = PaymentRequest(**body)
            
            payment_date = pay_req.payment_date if pay_req.payment_date else datetime.now().isoformat()
            
            cur.execute(
                f"""INSERT INTO {SCHEMA}.payments (category_id, amount, description, payment_date, legal_entity_id, contractor_id, department_id, created_by, status) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'draft') 
                   RETURNING id, category_id, amount, description, payment_date, created_at, legal_entity_id, contractor_id, department_id, status, created_by""",
                (pay_req.category_id, pay_req.amount, pay_req.description, payment_date, 
                 pay_req.legal_entity_id, pay_req.contractor_id, pay_req.department_id, payload['user_id'])
            )
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'category_id': row[1],
                'amount': float(row[2]),
                'description': row[3],
                'payment_date': row[4].isoformat() if row[4] else None,
                'created_at': row[5].isoformat() if row[5] else None,
                'legal_entity_id': row[6],
                'contractor_id': row[7],
                'department_id': row[8],
                'status': row[9],
                'created_by': row[10]
            })
        
        elif method == 'PUT':
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