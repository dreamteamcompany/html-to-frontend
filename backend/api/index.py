import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

SCHEMA = 't_p61788166_html_to_frontend'

class PaymentRequest(BaseModel):
    category_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    description: str = Field(default='')
    payment_date: str = Field(default='')
    legal_entity_id: int = Field(default=None)
    contractor_id: int = Field(default=None)
    
# Увеличим версию чтобы триггернуть деплой

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

class RoleRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(default='')
    permission_ids: list[int] = Field(default=[])

class PermissionRequest(BaseModel):
    name: str = Field(..., min_length=1)
    resource: str = Field(..., min_length=1)
    action: str = Field(..., min_length=1)
    description: str = Field(default='')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Универсальный API для работы с платежами, категориями и статистикой
    Поддерживает операции: получение списков, создание, обновление, удаление
    '''
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    endpoint = params.get('endpoint', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        # Категории
        if endpoint == 'categories':
            return handle_categories(method, event, conn)
        
        # Платежи
        elif endpoint == 'payments':
            return handle_payments(method, event, conn)
        
        # Статистика
        elif endpoint == 'stats':
            return handle_stats(method, conn)
        
        # Юридические лица
        elif endpoint == 'legal-entities':
            return handle_legal_entities(method, event, conn)
        
        # Дополнительные поля
        elif endpoint == 'custom-fields':
            return handle_custom_fields(method, event, conn)
        
        # Контрагенты
        elif endpoint == 'contractors':
            return handle_contractors(method, event, conn)
        
        # Роли
        elif endpoint == 'roles':
            return handle_roles(method, event, conn)
        
        # Права
        elif endpoint == 'permissions':
            return handle_permissions(method, event, conn)
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not found'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()


def handle_categories(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    '''Обработка запросов к категориям'''
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
    '''Обработка запросов к платежам'''
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
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
                    ct.name as contractor_name
                FROM payments p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN legal_entities le ON p.legal_entity_id = le.id
                LEFT JOIN contractors ct ON p.contractor_id = ct.id
                ORDER BY p.payment_date DESC
            """)
            rows = cur.fetchall()
            payments = [
                {
                    'id': row[0],
                    'category_id': row[1],
                    'category_name': row[2] or 'Без категории',
                    'category_icon': row[3] or 'Tag',
                    'amount': float(row[4]),
                    'description': row[5],
                    'payment_date': row[6].isoformat() if row[6] else None,
                    'created_at': row[7].isoformat() if row[7] else None,
                    'legal_entity_id': row[8],
                    'legal_entity_name': row[9] or '',
                    'contractor_id': row[10],
                    'contractor_name': row[11] or ''
                }
                for row in rows
            ]
            return response(200, payments)
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            payment_req = PaymentRequest(**body_data)
            
            payment_date = payment_req.payment_date if payment_req.payment_date else datetime.now().isoformat()
            
            cur.execute("""
                INSERT INTO payments (category_id, amount, description, payment_date, legal_entity_id, contractor_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, category_id, amount, description, payment_date, created_at, legal_entity_id, contractor_id
            """, (payment_req.category_id, payment_req.amount, payment_req.description, payment_date, payment_req.legal_entity_id, payment_req.contractor_id))
            
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'category_id': row[1],
                'amount': float(row[2]),
                'description': row[3],
                'payment_date': row[4].isoformat() if row[4] else None,
                'created_at': row[5].isoformat() if row[5] else None
            })
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()


def handle_stats(method: str, conn) -> Dict[str, Any]:
    '''Обработка запросов статистики'''
    if method != 'GET':
        return response(405, {'error': 'Method not allowed'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Статистика по категориям
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
        
        category_stats = [
            {
                'id': row['id'],
                'name': row['name'],
                'icon': row['icon'],
                'total': float(row['total'])
            }
            for row in cur.fetchall()
        ]
        
        # Общая сумма
        cur.execute("SELECT COALESCE(SUM(amount), 0) as total FROM payments")
        total_amount = float(cur.fetchone()['total'])
        
        # Количество платежей
        cur.execute("SELECT COUNT(*) as count FROM payments")
        payment_count = cur.fetchone()['count']
        
        return response(200, {
            'total': total_amount,
            'payment_count': payment_count,
            'categories': category_stats
        })
    
    finally:
        cur.close()


def handle_legal_entities(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    '''Обработка запросов к юридическим лицам'''
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
            body_data = json.loads(event.get('body', '{}'))
            entity_req = LegalEntityRequest(**body_data)
            
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
            body_data = json.loads(event.get('body', '{}'))
            entity_id = body_data.get('id')
            entity_req = LegalEntityRequest(**body_data)
            
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
    '''Обработка запросов к дополнительным полям'''
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


def handle_roles(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    '''Обработка запросов к ролям'''
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
            params = event.get('queryStringParameters') or {}
            role_id = params.get('id')
            
            if not role_id:
                return response(400, {'error': 'ID is required'})
            
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
    '''Обработка запросов к правам доступа'''
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
                    'description': row[4],
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
                'description': row[4],
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
                'description': row[4],
                'created_at': row[5].isoformat() if row[5] else None
            })
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            perm_id = params.get('id')
            
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
            body = json.loads(event.get('body', '{}'))
            field_id = body.get('id')
            
            if not field_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute('DELETE FROM payment_custom_values WHERE custom_field_id = %s', (field_id,))
            cur.execute('DELETE FROM custom_fields WHERE id = %s', (field_id,))
            conn.commit()
            
            return response(200, {'success': True})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()


def handle_contractors(method: str, event: Dict[str, Any], conn) -> Dict[str, Any]:
    '''Обработка запросов к контрагентам'''
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''SELECT id, name, inn, kpp, ogrn, legal_address, actual_address,
                          phone, email, contact_person, bank_name, bank_bik, bank_account,
                          correspondent_account, notes, is_active, created_at, updated_at
                          FROM contractors WHERE is_active = true ORDER BY name''')
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
                    'is_active': row[15],
                    'created_at': row[16].isoformat() if row[16] else None,
                    'updated_at': row[17].isoformat() if row[17] else None
                }
                for row in rows
            ]
            return response(200, contractors)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            contractor_req = ContractorRequest(**body)
            
            cur.execute('''
                INSERT INTO contractors (name, inn, kpp, ogrn, legal_address, actual_address,
                    phone, email, contact_person, bank_name, bank_bik, bank_account,
                    correspondent_account, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, inn, created_at
            ''', (contractor_req.name, contractor_req.inn, contractor_req.kpp, contractor_req.ogrn,
                  contractor_req.legal_address, contractor_req.actual_address, contractor_req.phone,
                  contractor_req.email, contractor_req.contact_person, contractor_req.bank_name,
                  contractor_req.bank_bik, contractor_req.bank_account, contractor_req.correspondent_account,
                  contractor_req.notes))
            row = cur.fetchone()
            conn.commit()
            
            return response(201, {
                'id': row[0],
                'name': row[1],
                'inn': row[2] or '',
                'created_at': row[3].isoformat() if row[3] else None
            })
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            contractor_id = body.get('id')
            contractor_req = ContractorRequest(**body)
            
            if not contractor_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute('''
                UPDATE contractors SET name = %s, inn = %s, kpp = %s, ogrn = %s,
                    legal_address = %s, actual_address = %s, phone = %s, email = %s,
                    contact_person = %s, bank_name = %s, bank_bik = %s, bank_account = %s,
                    correspondent_account = %s, notes = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, inn, updated_at
            ''', (contractor_req.name, contractor_req.inn, contractor_req.kpp, contractor_req.ogrn,
                  contractor_req.legal_address, contractor_req.actual_address, contractor_req.phone,
                  contractor_req.email, contractor_req.contact_person, contractor_req.bank_name,
                  contractor_req.bank_bik, contractor_req.bank_account, contractor_req.correspondent_account,
                  contractor_req.notes, contractor_id))
            row = cur.fetchone()
            
            if not row:
                return response(404, {'error': 'Contractor not found'})
            
            conn.commit()
            
            return response(200, {
                'id': row[0],
                'name': row[1],
                'inn': row[2] or '',
                'updated_at': row[3].isoformat() if row[3] else None
            })
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            contractor_id = params.get('id')
            
            if not contractor_id:
                return response(400, {'error': 'ID is required'})
            
            cur.execute('UPDATE contractors SET is_active = false WHERE id = %s', (contractor_id,))
            conn.commit()
            
            return response(200, {'success': True})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        cur.close()


def response(status: int, data: Any) -> Dict[str, Any]:
    '''Формирование HTTP ответа'''
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False),
        'isBase64Encoded': False
    }