import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class PaymentRequest(BaseModel):
    category_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    description: str = Field(default='')
    payment_date: str = Field(default='')
    legal_entity_id: int = Field(default=None)
    
# Увеличим версию чтобы триггернуть деплой

class CategoryRequest(BaseModel):
    name: str = Field(..., min_length=1)
    icon: str = Field(default='Tag')

class LegalEntityRequest(BaseModel):
    name: str = Field(..., min_length=1)
    inn: str = Field(default='')
    kpp: str = Field(default='')
    address: str = Field(default='')

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
                    le.name as legal_entity_name
                FROM payments p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN legal_entities le ON p.legal_entity_id = le.id
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
                    'legal_entity_name': row[9] or ''
                }
                for row in rows
            ]
            return response(200, payments)
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            payment_req = PaymentRequest(**body_data)
            
            payment_date = payment_req.payment_date if payment_req.payment_date else datetime.now().isoformat()
            
            cur.execute("""
                INSERT INTO payments (category_id, amount, description, payment_date, legal_entity_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, category_id, amount, description, payment_date, created_at, legal_entity_id
            """, (payment_req.category_id, payment_req.amount, payment_req.description, payment_date, payment_req.legal_entity_id))
            
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