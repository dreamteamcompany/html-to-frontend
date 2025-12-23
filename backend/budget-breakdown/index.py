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
    Бизнес: Агрегация бюджета по категориям расходов
    Args: event - словарь с httpMethod, queryStringParameters
          context - объект с атрибутами: request_id, function_name, function_version, memory_limit_in_mb
    Returns: HTTP ответ с массивом категорий и их суммами
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return response(200, {})
    
    if method != 'GET':
        return response(405, {'error': 'Method not allowed'})
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = f"""
            SELECT 
                c.id as category_id,
                c.name,
                c.icon,
                COALESCE(SUM(p.amount), 0) as total_amount,
                CASE 
                    WHEN (SELECT SUM(amount) FROM {SCHEMA}.payments WHERE status IN ('approved', 'paid')) > 0
                    THEN ROUND((COALESCE(SUM(p.amount), 0) * 100.0 / (SELECT SUM(amount) FROM {SCHEMA}.payments WHERE status IN ('approved', 'paid'))), 1)
                    ELSE 0
                END as percentage
            FROM {SCHEMA}.categories c
            LEFT JOIN {SCHEMA}.payments p ON c.id = p.category_id 
                AND p.status IN ('approved', 'paid')
            GROUP BY c.id, c.name, c.icon
            HAVING COALESCE(SUM(p.amount), 0) > 0
            ORDER BY total_amount DESC
        """
        
        cur.execute(query)
        rows = cur.fetchall()
        
        result = []
        for row in rows:
            cur2 = conn.cursor(cursor_factory=RealDictCursor)
            payments_query = f"""
                SELECT 
                    COALESCE(s.name, p.description, 'Без названия') as service,
                    p.amount,
                    p.status
                FROM {SCHEMA}.payments p
                LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
                WHERE p.category_id = {row['category_id']}
                    AND p.status IN ('approved', 'paid')
                ORDER BY p.amount DESC
                LIMIT 5
            """
            cur2.execute(payments_query)
            payments = cur2.fetchall()
            cur2.close()
            
            result.append({
                'category_id': row['category_id'],
                'name': row['name'],
                'icon': row['icon'],
                'amount': float(row['total_amount']),
                'percentage': float(row['percentage']),
                'payments': [
                    {
                        'service': p['service'],
                        'amount': float(p['amount']),
                        'status': p['status']
                    }
                    for p in payments
                ]
            })
        
        cur.close()
        conn.close()
        
        return response(200, result)
    
    except Exception as e:
        if conn:
            conn.close()
        return response(500, {'error': str(e)})