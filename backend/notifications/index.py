"""
API для управления уведомлениями пользователей
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id'
            },
            'body': ''
        }
    
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    try:
        if method == 'GET':
            return get_notifications(user_id, event)
        elif method == 'PUT':
            return mark_as_read(user_id, event)
        else:
            return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def get_notifications(user_id: str, event: dict):
    """Получение уведомлений пользователя"""
    params = event.get('queryStringParameters') or {}
    unread_only = params.get('unread_only') == 'true'
    limit = int(params.get('limit', 50))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем уведомления
    query = """
        SELECT 
            n.id,
            n.ticket_id,
            n.type,
            n.message,
            n.is_read,
            n.created_at,
            t.title as ticket_title
        FROM t_p61788166_html_to_frontend.notifications n
        LEFT JOIN t_p61788166_html_to_frontend.tickets t ON n.ticket_id = t.id
        WHERE n.user_id = %s
    """
    
    if unread_only:
        query += " AND n.is_read = false"
    
    query += " ORDER BY n.created_at DESC LIMIT %s"
    
    cur.execute(query, (user_id, limit))
    notifications = cur.fetchall()
    
    # Получаем счетчик непрочитанных
    cur.execute("""
        SELECT COUNT(*) as unread_count
        FROM t_p61788166_html_to_frontend.notifications
        WHERE user_id = %s AND is_read = false
    """, (user_id,))
    
    unread_count = cur.fetchone()['unread_count']
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'notifications': [dict(n) for n in notifications],
            'unread_count': unread_count
        }, default=str)
    }

def mark_as_read(user_id: str, event: dict):
    """Отметить уведомления как прочитанные"""
    body = event.get('body', '')
    if not body:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'notification_ids or mark_all is required'})
        }
    data = json.loads(body)
    notification_ids = data.get('notification_ids', [])
    mark_all = data.get('mark_all', False)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if mark_all:
        # Отмечаем все уведомления пользователя как прочитанные
        cur.execute("""
            UPDATE t_p61788166_html_to_frontend.notifications
            SET is_read = true
            WHERE user_id = %s AND is_read = false
        """, (user_id,))
    elif notification_ids:
        # Отмечаем конкретные уведомления как прочитанные
        cur.execute("""
            UPDATE t_p61788166_html_to_frontend.notifications
            SET is_read = true
            WHERE id = ANY(%s) AND user_id = %s
        """, (notification_ids, user_id))
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'notification_ids or mark_all is required'})
        }
    
    conn.commit()
    affected_rows = cur.rowcount
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': f'Отмечено как прочитанные: {affected_rows}'})
    }