"""API для статистики и дашбордов"""
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

# Environment
SCHEMA = os.environ.get('DB_SCHEMA', 'public')
DSN = os.environ['DATABASE_URL']

def response(status: int, body: Any) -> Dict[str, Any]:
    """Формирует HTTP ответ"""
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id'
        },
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }

def verify_token(event: Dict[str, Any], conn) -> tuple:
    """Проверяет токен и возвращает (payload, error_response)"""
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    
    if not token:
        return None, response(401, {'error': 'Unauthorized'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT user_id, expires_at 
        FROM {SCHEMA}.auth_tokens 
        WHERE token = %s AND expires_at > NOW()
    """, (token,))
    
    row = cur.fetchone()
    cur.close()
    
    if not row:
        return None, response(401, {'error': 'Invalid or expired token'})
    
    return {'user_id': row['user_id']}, None

def handler(event: dict, context) -> dict:
    """
    API для статистики и дашбордов.
    
    Endpoints:
    - GET /stats - общая статистика
    - GET /dashboard-stats - статистика для дашборда
    - GET /budget-breakdown - детализация бюджета
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    # CORS preflight
    if method == 'OPTIONS':
        return response(200, {})
    
    if method != 'GET':
        return response(405, {'error': 'Method not allowed'})
    
    conn = psycopg2.connect(DSN)
    
    try:
        payload, error = verify_token(event, conn)
        if error:
            return error
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Общая статистика
        cur.execute(f"""
            SELECT 
                COUNT(*) as total_payments,
                COALESCE(SUM(amount), 0) as total_amount,
                COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
            FROM {SCHEMA}.payments
        """)
        
        general_stats = dict(cur.fetchone())
        
        # Топ категорий
        cur.execute(f"""
            SELECT c.name, c.icon, COALESCE(SUM(p.amount), 0) as total_amount
            FROM {SCHEMA}.categories c
            LEFT JOIN {SCHEMA}.payments p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.icon
            ORDER BY total_amount DESC
            LIMIT 10
        """)
        
        top_categories = [dict(row) for row in cur.fetchall()]
        
        # Динамика по месяцам
        cur.execute(f"""
            SELECT 
                TO_CHAR(payment_date, 'YYYY-MM') as month,
                COALESCE(SUM(amount), 0) as total_amount
            FROM {SCHEMA}.payments
            WHERE payment_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
            ORDER BY month
        """)
        
        monthly_trend = [dict(row) for row in cur.fetchall()]
        
        # Статистика по экономиям
        cur.execute(f"""
            SELECT 
                COUNT(*) as total_savings_count,
                SUM(CASE 
                    WHEN frequency = 'once' THEN amount
                    WHEN frequency = 'monthly' THEN amount * 12
                    WHEN frequency = 'quarterly' THEN amount * 4
                    WHEN frequency = 'yearly' THEN amount
                    ELSE 0
                END) as total_annual_savings
            FROM {SCHEMA}.savings
        """)
        
        savings_stats = dict(cur.fetchone())
        
        cur.close()
        
        return response(200, {
            'general': general_stats,
            'top_categories': top_categories,
            'monthly_trend': monthly_trend,
            'savings': savings_stats
        })
    
    finally:
        conn.close()