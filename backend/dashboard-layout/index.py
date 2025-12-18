import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    '''
    Сохранение и загрузка расположения карточек дашборда
    GET - получить расположение для пользователя
    POST - сохранить расположение для пользователя
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers_dict = event.get('headers', {})
    user_id = headers_dict.get('x-user-id') or headers_dict.get('X-User-Id') or 'default'
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cur.execute(
                "SELECT card_id, x, y, width, height FROM dashboard_layouts WHERE user_id = %s",
                (user_id,)
            )
            rows = cur.fetchall()
            
            layouts = [dict(row) for row in rows]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'layouts': layouts}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            layouts = body_data.get('layouts', [])
            
            for layout in layouts:
                cur.execute(
                    """
                    INSERT INTO dashboard_layouts (user_id, card_id, x, y, width, height, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, card_id)
                    DO UPDATE SET x = EXCLUDED.x, y = EXCLUDED.y, width = EXCLUDED.width, 
                                  height = EXCLUDED.height, updated_at = CURRENT_TIMESTAMP
                    """,
                    (user_id, layout['id'], layout['x'], layout['y'], layout['width'], layout['height'])
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Расположение сохранено'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
