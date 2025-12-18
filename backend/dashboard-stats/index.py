import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получает статистику расходов для дашборда
    Args: event - dict с httpMethod, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с данными статистики
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
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
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Получаем общую сумму одобренных/в процессе одобрения платежей
    cur.execute("""
        SELECT 
            COALESCE(SUM(amount), 0) as total_amount,
            COUNT(*) as total_count
        FROM t_p61788166_html_to_frontend.payments 
        WHERE status = 'pending_ceo' 
           OR ceo_approved_at IS NOT NULL
    """)
    row = cur.fetchone()
    total_amount = float(row[0]) if row[0] else 0
    total_count = int(row[1]) if row[1] else 0
    
    # Получаем сумму за прошлый месяц для расчета динамики
    one_month_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    cur.execute("""
        SELECT COALESCE(SUM(amount), 0) as prev_amount
        FROM t_p61788166_html_to_frontend.payments 
        WHERE (status = 'pending_ceo' OR ceo_approved_at IS NOT NULL)
          AND created_at < %s
    """, (one_month_ago,))
    row = cur.fetchone()
    prev_amount = float(row[0]) if row[0] else 0
    
    cur.close()
    conn.close()
    
    # Рассчитываем процент изменения
    if prev_amount > 0:
        change_percent = ((total_amount - prev_amount) / prev_amount) * 100
    else:
        change_percent = 100.0 if total_amount > 0 else 0.0
    
    result = {
        'total_amount': total_amount,
        'total_count': total_count,
        'change_percent': round(change_percent, 1),
        'is_increase': change_percent > 0
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result),
        'isBase64Encoded': False
    }