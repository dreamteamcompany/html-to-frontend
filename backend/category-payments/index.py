import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

SCHEMA = 't_p61788166_html_to_frontend'

def response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Бизнес: Получение всех платежей по категории для детального просмотра
    Args: event - словарь с httpMethod, queryStringParameters (category_id)
          context - объект с атрибутами: request_id, function_name
    Returns: HTTP ответ с информацией о категории и списком платежей
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return response(200, {})
    
    if method != 'GET':
        return response(405, {'error': 'Method not allowed'})
    
    params = event.get('queryStringParameters', {})
    category_id = params.get('category_id')
    
    if not category_id:
        return response(400, {'error': 'category_id required'})
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        category_query = f"""
            SELECT 
                c.name,
                c.icon,
                COALESCE(SUM(p.amount), 0) as total_amount,
                COUNT(p.id) as payments_count
            FROM {SCHEMA}.categories c
            LEFT JOIN {SCHEMA}.payments p ON c.id = p.category_id 
                AND p.status IN ('approved', 'paid')
            WHERE c.id = {category_id}
            GROUP BY c.id, c.name, c.icon
        """
        
        cur.execute(category_query)
        category_row = cur.fetchone()
        
        if not category_row:
            cur.close()
            conn.close()
            return response(404, {'error': 'Category not found'})
        
        payments_query = f"""
            SELECT 
                p.id,
                p.category_id,
                c.name as category_name,
                c.icon as category_icon,
                COALESCE(s.name, p.description) as service,
                COALESCE(s.name, p.description) as service_name,
                p.amount,
                p.status,
                p.payment_date,
                p.description,
                p.contractor_id,
                COALESCE(contr.name, 'Не указан') as contractor,
                COALESCE(contr.name, 'Не указан') as contractor_name,
                p.legal_entity_id,
                COALESCE(le.name, 'Не указано') as legal_entity,
                COALESCE(le.name, 'Не указано') as legal_entity_name,
                p.department_id,
                COALESCE(dept.name, 'Не указан') as department,
                COALESCE(dept.name, 'Не указан') as department_name,
                p.service_id,
                p.invoice_number,
                p.invoice_date,
                p.created_at
            FROM {SCHEMA}.payments p
            LEFT JOIN {SCHEMA}.categories c ON p.category_id = c.id
            LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
            LEFT JOIN {SCHEMA}.contractors contr ON p.contractor_id = contr.id
            LEFT JOIN {SCHEMA}.legal_entities le ON p.legal_entity_id = le.id
            LEFT JOIN {SCHEMA}.customer_departments dept ON p.department_id = dept.id
            WHERE p.category_id = {category_id}
                AND p.status IN ('approved', 'paid')
            ORDER BY p.amount DESC
        """
        
        cur.execute(payments_query)
        payments_rows = cur.fetchall()
        
        color_map = {
            'Серверы': '#7551e9',
            'SaaS': '#3965ff',
            'Безопасность': '#01b574',
            'Оборудование': '#ffb547',
            'Разработка': '#ff6b6b',
            'Базы данных': '#a855f7'
        }
        
        result = {
            'category': {
                'name': category_row['name'],
                'icon': category_row['icon'],
                'color': color_map.get(category_row['name'], '#7551e9'),
                'total_amount': float(category_row['total_amount']),
                'payments_count': int(category_row['payments_count'])
            },
            'payments': [
                {
                    'id': row['id'],
                    'category_id': row['category_id'],
                    'category_name': row['category_name'],
                    'category_icon': row['category_icon'],
                    'service': row['service'],
                    'service_name': row['service_name'],
                    'service_id': row['service_id'],
                    'amount': float(row['amount']),
                    'status': row['status'],
                    'payment_date': row['payment_date'],
                    'description': row['description'],
                    'contractor': row['contractor'],
                    'contractor_name': row['contractor_name'],
                    'contractor_id': row['contractor_id'],
                    'legal_entity': row['legal_entity'],
                    'legal_entity_name': row['legal_entity_name'],
                    'legal_entity_id': row['legal_entity_id'],
                    'department': row['department'],
                    'department_name': row['department_name'],
                    'department_id': row['department_id'],
                    'invoice_number': row['invoice_number'],
                    'invoice_date': row['invoice_date'],
                    'created_at': row['created_at']
                }
                for row in payments_rows
            ]
        }
        
        cur.close()
        conn.close()
        
        return response(200, result)
    
    except Exception as e:
        if conn:
            conn.close()
        return response(500, {'error': str(e)})