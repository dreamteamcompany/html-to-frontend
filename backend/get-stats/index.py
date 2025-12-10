import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получает статистику по IT расходам из базы данных
    Args: event - dict с httpMethod, headers
          context - объект с атрибутами: request_id, function_name
    Returns: JSON со статистикой расходов по категориям
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем статистику по категориям
    cur.execute("""
        SELECT 
            category,
            COALESCE(SUM(amount), 0) as total
        FROM payments
        GROUP BY category
    """)
    
    category_stats = {row['category']: float(row['total']) for row in cur.fetchall()}
    
    # Получаем общую сумму
    cur.execute("SELECT COALESCE(SUM(amount), 0) as total FROM payments")
    total_amount = float(cur.fetchone()['total'])
    
    # Получаем количество платежей
    cur.execute("SELECT COUNT(*) as count FROM payments")
    payment_count = cur.fetchone()['count']
    
    cur.close()
    conn.close()
    
    result = {
        'total': total_amount,
        'payment_count': payment_count,
        'categories': {
            'servers': category_stats.get('servers', 0),
            'communications': category_stats.get('communications', 0),
            'websites': category_stats.get('websites', 0),
            'security': category_stats.get('security', 0)
        }
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result),
        'isBase64Encoded': False
    }
