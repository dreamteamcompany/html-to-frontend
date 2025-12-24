import json
import os
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p61788166_html_to_frontend'

def handler(event: dict, context) -> dict:
    """API для получения справочников заявок"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только GET запросы'}),
            'isBase64Encoded': False
        }
    
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Server configuration error'}),
            'isBase64Encoded': False
        }
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недействительный токен'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(f"SELECT id, name FROM {SCHEMA}.ticket_categories WHERE deleted_at IS NULL ORDER BY name")
        categories = [dict(row) for row in cur.fetchall()]
        
        cur.execute(f"SELECT id, name, level FROM {SCHEMA}.ticket_priorities WHERE deleted_at IS NULL ORDER BY level DESC")
        priorities = [dict(row) for row in cur.fetchall()]
        
        cur.execute(f"SELECT id, name, color FROM {SCHEMA}.ticket_statuses WHERE deleted_at IS NULL ORDER BY id")
        statuses = [dict(row) for row in cur.fetchall()]
        
        cur.execute(f"SELECT id, name FROM {SCHEMA}.departments WHERE deleted_at IS NULL ORDER BY name")
        departments = [dict(row) for row in cur.fetchall()]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'categories': categories,
                'priorities': priorities,
                'statuses': statuses,
                'departments': departments,
                'custom_fields': []
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
