"""
Обработка запланированных платежей: создание, чтение, обновление, удаление и конвертация в обычные платежи
"""
import json
import os
from typing import Any, Dict, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p61788166_html_to_frontend'

def get_db_connection():
    """Создание подключения к БД"""
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Проверка токена пользователя"""
    if not token:
        return None
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"""
                SELECT id, username, email 
                FROM {SCHEMA}.users 
                WHERE token = %s
            """, (token,))
            return dict(cur.fetchone()) if cur.rowcount > 0 else None
    finally:
        conn.close()

def get_planned_payments(user_id: int) -> list:
    """Получение списка запланированных платежей"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"""
                SELECT 
                    pp.id,
                    pp.category_id,
                    c.name as category_name,
                    c.icon as category_icon,
                    pp.description,
                    pp.amount,
                    pp.planned_date,
                    pp.legal_entity_id,
                    le.name as legal_entity_name,
                    pp.contractor_id,
                    co.name as contractor_name,
                    pp.department_id,
                    cd.name as department_name,
                    pp.service_id,
                    s.name as service_name,
                    s.description as service_description,
                    pp.invoice_number,
                    pp.invoice_date,
                    pp.recurrence_type,
                    pp.recurrence_end_date,
                    pp.is_active,
                    pp.created_by,
                    u.username as created_by_name,
                    pp.created_at,
                    pp.converted_to_payment_id,
                    pp.converted_at
                FROM {SCHEMA}.planned_payments pp
                LEFT JOIN {SCHEMA}.categories c ON pp.category_id = c.id
                LEFT JOIN {SCHEMA}.legal_entities le ON pp.legal_entity_id = le.id
                LEFT JOIN {SCHEMA}.contractors co ON pp.contractor_id = co.id
                LEFT JOIN {SCHEMA}.customer_departments cd ON pp.department_id = cd.id
                LEFT JOIN {SCHEMA}.services s ON pp.service_id = s.id
                LEFT JOIN {SCHEMA}.users u ON pp.created_by = u.id
                WHERE pp.is_active = true
                ORDER BY pp.planned_date ASC
            """)
            
            payments = [dict(row) for row in cur.fetchall()]
            
            # Получаем кастомные поля для каждого платежа
            for payment in payments:
                cur.execute(f"""
                    SELECT 
                        cf.id,
                        cf.name,
                        cf.field_type,
                        pcfv.value
                    FROM {SCHEMA}.planned_payment_custom_field_values pcfv
                    JOIN {SCHEMA}.custom_fields cf ON pcfv.custom_field_id = cf.id
                    WHERE pcfv.planned_payment_id = %s
                """, (payment['id'],))
                payment['custom_fields'] = [dict(row) for row in cur.fetchall()]
            
            return payments
    finally:
        conn.close()

def create_planned_payment(data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Создание нового запланированного платежа"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.planned_payments 
                (category_id, amount, description, planned_date, legal_entity_id, 
                 contractor_id, department_id, service_id, invoice_number, invoice_date,
                 recurrence_type, recurrence_end_date, created_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                data.get('category_id'),
                data.get('amount'),
                data.get('description'),
                data.get('planned_date'),
                data.get('legal_entity_id'),
                data.get('contractor_id'),
                data.get('department_id'),
                data.get('service_id'),
                data.get('invoice_number'),
                data.get('invoice_date'),
                data.get('recurrence_type', 'once'),
                data.get('recurrence_end_date'),
                user_id
            ))
            
            payment_id = cur.fetchone()['id']
            
            # Сохраняем кастомные поля
            custom_fields = data.get('custom_fields', {})
            for field_id, value in custom_fields.items():
                if value:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.planned_payment_custom_field_values 
                        (planned_payment_id, custom_field_id, value)
                        VALUES (%s, %s, %s)
                    """, (payment_id, field_id, value))
            
            conn.commit()
            return {'id': payment_id, 'message': 'Запланированный платёж создан'}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def update_planned_payment(payment_id: int, data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Обновление запланированного платежа"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Проверяем права доступа
            cur.execute(f"SELECT created_by FROM {SCHEMA}.planned_payments WHERE id = %s", (payment_id,))
            result = cur.fetchone()
            if not result:
                return {'error': 'Платёж не найден'}
            
            cur.execute(f"""
                UPDATE {SCHEMA}.planned_payments 
                SET category_id = %s, amount = %s, description = %s, planned_date = %s,
                    legal_entity_id = %s, contractor_id = %s, department_id = %s,
                    service_id = %s, invoice_number = %s, invoice_date = %s,
                    recurrence_type = %s, recurrence_end_date = %s
                WHERE id = %s
            """, (
                data.get('category_id'),
                data.get('amount'),
                data.get('description'),
                data.get('planned_date'),
                data.get('legal_entity_id'),
                data.get('contractor_id'),
                data.get('department_id'),
                data.get('service_id'),
                data.get('invoice_number'),
                data.get('invoice_date'),
                data.get('recurrence_type', 'once'),
                data.get('recurrence_end_date'),
                payment_id
            ))
            
            # Удаляем старые кастомные поля
            cur.execute(f"""
                UPDATE {SCHEMA}.planned_payment_custom_field_values 
                SET value = NULL 
                WHERE planned_payment_id = %s
            """, (payment_id,))
            
            # Добавляем новые
            custom_fields = data.get('custom_fields', {})
            for field_id, value in custom_fields.items():
                if value:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.planned_payment_custom_field_values 
                        (planned_payment_id, custom_field_id, value)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (planned_payment_id, custom_field_id) 
                        DO UPDATE SET value = EXCLUDED.value
                    """, (payment_id, field_id, value))
            
            conn.commit()
            return {'message': 'Запланированный платёж обновлён'}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def delete_planned_payment(payment_id: int, user_id: int) -> Dict[str, Any]:
    """Удаление (деактивация) запланированного платежа"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"""
                UPDATE {SCHEMA}.planned_payments 
                SET is_active = false 
                WHERE id = %s
            """, (payment_id,))
            
            conn.commit()
            return {'message': 'Запланированный платёж удалён'}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def convert_to_payment(payment_id: int, user_id: int) -> Dict[str, Any]:
    """Конвертация запланированного платежа в обычный"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Получаем данные запланированного платежа
            cur.execute(f"""
                SELECT * FROM {SCHEMA}.planned_payments WHERE id = %s AND is_active = true
            """, (payment_id,))
            planned = cur.fetchone()
            
            if not planned:
                return {'error': 'Запланированный платёж не найден'}
            
            # Создаём обычный платёж
            cur.execute(f"""
                INSERT INTO {SCHEMA}.payments 
                (category_id, amount, description, payment_date, legal_entity_id,
                 contractor_id, department_id, service_id, invoice_number, invoice_date,
                 status, created_by, created_at, category)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'draft', %s, NOW(), 
                        (SELECT name FROM {SCHEMA}.categories WHERE id = %s))
                RETURNING id
            """, (
                planned['category_id'],
                planned['amount'],
                planned['description'],
                planned['planned_date'],
                planned['legal_entity_id'],
                planned['contractor_id'],
                planned['department_id'],
                planned['service_id'],
                planned['invoice_number'],
                planned['invoice_date'],
                user_id,
                planned['category_id']
            ))
            
            new_payment_id = cur.fetchone()['id']
            
            # Копируем кастомные поля
            cur.execute(f"""
                INSERT INTO {SCHEMA}.payment_custom_field_values (payment_id, custom_field_id, value)
                SELECT %s, custom_field_id, value
                FROM {SCHEMA}.planned_payment_custom_field_values
                WHERE planned_payment_id = %s
            """, (new_payment_id, payment_id))
            
            # Помечаем запланированный платёж как конвертированный
            cur.execute(f"""
                UPDATE {SCHEMA}.planned_payments 
                SET converted_to_payment_id = %s, converted_at = NOW()
                WHERE id = %s
            """, (new_payment_id, payment_id))
            
            conn.commit()
            return {'payment_id': new_payment_id, 'message': 'Платёж создан из запланированного'}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Главный обработчик запросов"""
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Проверка токена
    token = event.get('headers', {}).get('X-Auth-Token', '')
    user = verify_token(token)
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            payments = get_planned_payments(user['id'])
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(payments, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'convert':
                payment_id = body.get('payment_id')
                result = convert_to_payment(payment_id, user['id'])
            else:
                result = create_planned_payment(body, user['id'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            payment_id = body.get('id')
            result = update_planned_payment(payment_id, body, user['id'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            payment_id = int(query_params.get('id', 0))
            result = delete_planned_payment(payment_id, user['id'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
