"""API для уведомлений"""
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
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    API для уведомлений.
    
    Endpoints:
    - GET /notifications - получить список уведомлений
    - PUT /notifications/{id}/read - отметить как прочитанное
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    # CORS preflight
    if method == 'OPTIONS':
        return response(200, {})
    
    conn = psycopg2.connect(DSN)
    
    try:
        payload, error = verify_token(event, conn)
        if error:
            return error
        
        user_id = payload['user_id']
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            # Получить уведомления пользователя
            cur.execute(f"""
                SELECT id, user_id, type, title, message, is_read, created_at, data
                FROM {SCHEMA}.notifications
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 50
            """, (user_id,))
            
            notifications = [dict(row) for row in cur.fetchall()]
            cur.close()
            
            return response(200, {'notifications': notifications})
        
        elif method == 'PUT':
            # Отметить уведомление как прочитанное
            path_parts = path.rstrip('/').split('/')
            notification_id = None
            if len(path_parts) > 0 and path_parts[-2].isdigit():
                notification_id = int(path_parts[-2])
            
            if not notification_id:
                return response(400, {'error': 'ID уведомления не указан'})
            
            cur.execute(f"""
                UPDATE {SCHEMA}.notifications
                SET is_read = true
                WHERE id = %s AND user_id = %s
            """, (notification_id, user_id))
            
            if cur.rowcount == 0:
                cur.close()
                return response(404, {'error': 'Уведомление не найдено'})
            
            conn.commit()
            cur.close()
            
            return response(200, {'message': 'Уведомление прочитано'})
        
        return response(405, {'error': 'Method not allowed'})
    
    finally:
        conn.close()